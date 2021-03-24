import React from 'react'
import { connect } from 'react-redux'
import L from 'leaflet'
import chroma from 'chroma-js'
import ExtraMarkers from './extraMarkers'
import HereTileLayer from './hereTileLayer'
import {
  fetchHereReverseGeocode,
  hideIsochronesIndex
} from '../actions/actions'
import PropTypes from 'prop-types'
import { saveAs } from 'file-saver'

const style = {
  width: '100%',
  height: '100vh'
}

// const CartoDB_VoyagerLabelsUnder = L.tileLayer(
//   'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
//   {
//     attribution:
//       '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
//     subdomains: 'abcd',
//     maxZoom: 19
//   }
// )
const hereReducedNight = HereTileLayer.here({
  appId: 'WE5bWchCpq5Eexw4i6oF',
  appCode: 'kP0Y9tR9O_wTSffTE4yuVuW-dXAVzo-B7VToTaYiXCg',
  scheme: 'reduced.night',
})

const hereReducedDay = HereTileLayer.here({
  appId: 'WE5bWchCpq5Eexw4i6oF',
  appCode: 'kP0Y9tR9O_wTSffTE4yuVuW-dXAVzo-B7VToTaYiXCg',
  scheme: 'reduced.day'
})

const hereTruck = HereTileLayer.here({
  appId: 'WE5bWchCpq5Eexw4i6oF',
  appCode: 'kP0Y9tR9O_wTSffTE4yuVuW-dXAVzo-B7VToTaYiXCg',
  scheme: 'normal.day',
  resource2: 'trucktile'
})

const markersLayer = L.layerGroup()

const isochronesLayer = L.layerGroup()

const southWest = L.latLng(48, 13),
  northEast = L.latLng(55, 27),
  bounds = L.latLngBounds(southWest, northEast)

const mapParams = {
  center: [52.2297, 21.0122],
  zoomControl: false,
  maxBounds: bounds,
  zoom: 7,
  minZoom: 5,
  zoomDelta: 0.15,
  zoomSnap: 0,
  zoomAnimation: true,
  layers: [markersLayer, isochronesLayer, hereReducedDay]
}

class Map extends React.Component {
  static propTypes = {
    isochronesControls: PropTypes.array.isRequired,
    mapEvents: PropTypes.object,
    hereConfig: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  }
  componentDidMount() {
    this.map = L.map('map', mapParams)

    var isochronesPane = this.map.createPane('isochronesPane')

    isochronesPane.style.opacity = 0.9

    const baseMaps = {
      'HERE reduced.day': hereReducedDay,
      'HERE reduced.night': hereReducedNight,
      'HERE fleet': hereTruck
    }

    L.control.layers(baseMaps).addTo(this.map)

    L.control
      .zoom({
        position: 'topright'
      })
      .addTo(this.map)
  }

  updateMarkers() {
    const { isochronesControls } = this.props

    //markersLayer.clearLayers()

    let cnt = 0
    for (let isochrones of isochronesControls) {
      // add marker
      if (isochrones.geocodeResults.length > 0) {
        for (let location of isochrones.geocodeResults) {
          if (location.selected) {
            // if a address is geocoded normally, clear layer beforehand
            if (!isochrones.reverse) this.clearLayerByIndex(cnt)
            this.addIsochronesMarker(location, cnt, this.isMarkerPresent(cnt))
          }
        }
      }

      cnt += 1
    }
  }

  getTooltipContent(settings, isochrone) {
    let displayName = 'auto'
    let travelIcon = 'car'
    if (settings.mode == 'car') {
      travelIcon = 'car'
    } else if (settings.mode == 'truck') {
      travelIcon = 'truck'
    } else if (settings.mode == 'pedestrian') {
      travelIcon = 'male'
    }

    let rangeTypeIcon = 'arrows alternate horizontal'
    if (settings.rangetype == 'time') rangeTypeIcon = 'clock'

    return {
      html: `<div class="ui list">
        <div class="item">
          <i class="${travelIcon} icon"></i>
          <div class="content">
            ${settings.displayName}
          </div>
        </div>
        <div class="item">
          <i class="${rangeTypeIcon} icon"></i>
          <div class="content">
            ${
              settings.rangetype === 'time'
                ? isochrone.range / 60 + ' minut'
                : isochrone.range / 1000 + ' kilometers'
            }
          </div>
        </div>
      </div>`,
      settings: {
        mode: settings.mode,
        range:
          settings.rangetype == 'time'
            ? isochrone.range / 60 + ' minut'
            : isochrone.range / 1000 + ' kilometers'
      }
    }
  }

  updateIsochrones(prevProps) {
    const { isochronesControls } = this.props

    isochronesLayer.clearLayers()

    for (let i = 0; i < isochronesControls.length; i++) {
      if (
        isochronesControls[i].isochrones.results.length > 0 &&
        isochronesControls[i].isochronesHidden == false
        //&& isochronesControls[i].isochrones.receivedAt > prevIsochronesControls[i].isochrones.receivedAt
      ) {
        let cnt = 0
        const isochroneResultsReversed =
          isochronesControls[i].isochrones.results
        const scaleHsl = chroma
          .scale(['#5433FF', '#20BDFF', '#A5FECB' ])
          .mode('hsl')
          .colors(isochronesControls[i].isochrones.results.length)

        const { settings } = isochronesControls[i]

        for (const isochrone of isochroneResultsReversed) {
          for (const isochroneComponent of isochrone.component) {
            const toolTipContent = this.getTooltipContent(settings, isochrone)
            this.addIsochrones(
              isochroneComponent.shape,
              toolTipContent,
              scaleHsl[cnt],
              i
            )
          }
          cnt += 1
        }
      }
    }
  }

  saveGeojson(features) {
    const isochronesSettings = []
    for (let feature of features.getLayers()) {
      isochronesSettings.push(feature.options.settings)
    }
    const geojson = features.toGeoJSON()
    for (let i = 0; i < geojson.features.length; i++) {
      geojson.features[i].properties.attribution =
      geojson.features[i].properties.settings = isochronesSettings[i]
    }
    var blob = new Blob([JSON.stringify(geojson)], {
      type: 'text/plain;charset=utf-8'
    })
    const file = 'heremaps_' + isochronesSettings[0] + '.geojson'
    saveAs(blob, file)
  }

  updateMap(prevProps) {
    const { mapEvents } = this.props
    if (mapEvents.receivedAt > prevProps.mapEvents.receivedAt) {
      let eventFeatures = L.featureGroup()

      switch (mapEvents.event) {
        case 'ZOOM_TO_ISOCHRONES':
          isochronesLayer.eachLayer(function(layer) {
            if (layer.options.index === mapEvents.controlIndex)
              eventFeatures.addLayer(layer)
          })

          this.map.fitBounds(eventFeatures.getBounds(), {
            paddingTopLeft: [100, 100]
          })

          break
        case 'TOGGLE_ISOCHRONES':
          this.props.dispatch(hideIsochronesIndex(mapEvents.controlIndex))
          break
        case 'ZOOM_TO_POINT':
          this.map.flyTo(mapEvents.latLng, 14)

          break
        case 'DOWNLOAD_ISOCHRONES':
          isochronesLayer.eachLayer(function(layer) {
            if (layer.options.index === mapEvents.controlIndex)
              eventFeatures.addLayer(layer)
          })
          this.saveGeojson(eventFeatures)
          break

        default:
          break
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateMarkers()
    this.updateIsochrones(prevProps)
    this.updateMap(prevProps)
  }

  clearLayerByIndex(idx) {
    markersLayer.eachLayer(function(layer) {
      if (layer.options.index === idx) markersLayer.removeLayer(layer)
    })
  }

  isMarkerPresent(idx) {
    let isPresent = false
    markersLayer.eachLayer(function(layer) {
      if (layer.options.index === idx) isPresent = true
    })
    return isPresent
  }

  updatePosition(obj) {
    const { dispatch, hereConfig } = this.props
    dispatch(
      fetchHereReverseGeocode({
        isoIndex: obj.isoIndex,
        hereConfig: hereConfig,
        ...obj.latLng
      })
    )
  }

  addIsochrones(geometry, tooltipContent, color, index) {
    L.polygon(
      geometry.map(function(coordString) {
        return coordString.split(',')
      }),
      {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: 'white',
        pane: 'isochronesPane',
        index: index,
        settings:
          tooltipContent.settings.mode + ',' + tooltipContent.settings.range
      }
    )
      .addTo(isochronesLayer)
      .bindTooltip(tooltipContent.html, { permanent: false, sticky: true })
  }
  addIsochronesMarker(location, idx, isPresent = false) {
    if (!isPresent) {
      const isochronesMarker = ExtraMarkers.icon({
        icon: 'fa-number',
        markerColor: 'blue',
        shape: 'star',
        prefix: 'fa',
        number: (idx + 1).toString()
      })

      const that = this

      L.marker(location.displayposition, {
        icon: isochronesMarker,
        draggable: true,
        index: idx
      })
        .addTo(markersLayer)
        .bindTooltip(location.title + ', ' + location.description, {
          permanent: false
        })
        .openTooltip()
        .on('dragend', function(e) {
          that.updatePosition({
            latLng: e.target.getLatLng(),
            isoIndex: e.target.options.index
          })
        })
    } else {
      markersLayer.eachLayer(function(layer) {
        if (layer.options.index === idx) {
          if (location.title.length > 0) {
            if (layer.getTooltip()) {
              layer.setTooltipContent(
                location.title + ', ' + location.description
              )
            } else {
              layer
                .bindTooltip(location.title + ', ' + location.description, {
                  permanent: false
                })
                .openTooltip()
            }
          } else {
            layer.unbindTooltip()
          }
        }
      })
    }
  }

  render() {
    return <div id="map" style={style} />
  }
}

const mapStateToProps = (state, ownProps) => {
  //console.log(state, ownProps)
  const isochronesControls = state.isochronesControls.controls
  const mapEvents = state.mapEvents
  const hereConfig = state.hereConfig
  return {
    isochronesControls,
    mapEvents,
    hereConfig
  }
}

export default connect(mapStateToProps)(Map)

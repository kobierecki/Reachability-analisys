import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Slider } from 'react-semantic-ui-range'
import {
  Label,
  Input,
  Button,
  Divider,
  Accordion,
  Icon,
  Checkbox,
  Form,
  Radio,
  Message
} from 'semantic-ui-react'
import { updateSettings } from '../actions/actions'
import moment from 'moment'
import DatetimePicker from 'react-semantic-datetime'

const transportModes = {
  pedestrian: {
    type: ['fastest', 'shortest']
  },
  car: {
    type: ['fastest', 'shortest', 'traffic'],
    traffic: ['enabled', 'disabled'],
    consumptionModel: ['default', 'standard'],
    customConsumptionDetails: {}
  },
  truck: {
    type: ['fastest'],
    traffic: ['enabled', 'disabled'],
    shippedHazardousGoods: [],
    limitedWeight: {},
    weightPerAxle: {},
    height: {},
    width: {},
    length: {},
    tunnelCategory: '',
    consumptionModel: ['default', 'standard'],
    customConsumptionDetails: {}
  }
}

const rangeTypes = {
  distance: {},
  time: {}
}

class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeIndex: 0,
      timeEnabled: false,
      apiMessageVisible: true
    }
  }

  static propTypes = {
    userTextInput: PropTypes.string,
    results: PropTypes.array,
    isFetching: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    controls: PropTypes.array.isRequired,
    controlindex: PropTypes.number.isRequired
  }

  updateSettings() {
    const { controls, controlindex, dispatch } = this.props

    dispatch(
      updateSettings({
        controlIndex: controlindex,
        settings: controls[controlindex].settings
      })
    )
  }

  handleDismiss = () => {
    this.setState({ apiMessageVisible: false })
  }

  handleClickAccordion = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleClickMode(mode) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.mode = mode

    this.updateSettings()
  }

  handleClickDirection(direction) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.direction = direction

    this.updateSettings()
  }

  handleClickTraffic(traffic) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.traffic = traffic

    this.updateSettings()
  }

  handleClickTimeValue(timeVal) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.timeVal = timeVal

    this.updateSettings()
  }

  handleRangetype(rangetype) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.rangetype = rangetype

    this.updateSettings()
  }

  handleHazardousGoods(e, { value }) {
    console.log(value)
    const { controls, controlindex } = this.props

    const indexOfVal = controls[
      controlindex
    ].settings.hgv.shippedHazardousGoods.indexOf(value)
    if (indexOfVal > -1) {
      controls[controlindex].settings.hgv.shippedHazardousGoods.splice(
        indexOfVal,
        1
      )
    } else {
      controls[controlindex].settings.hgv.shippedHazardousGoods.push(value)
    }

    this.updateSettings()
  }

  handleTunnelCategory(e, { value }) {
    const { controls, controlindex } = this.props

    const currentTunnelCat = controls[controlindex].settings.hgv.tunnelCategory
    controls[controlindex].settings.hgv.tunnelCategory =
      value == currentTunnelCat ? '' : value

    this.updateSettings()
  }

  clearTunnelCategory() {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.hgv.tunnelCategory = ''
    this.updateSettings()
  }

  handleEnableTime() {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.timeEnabled = !controls[controlindex]
      .settings.timeEnabled

    this.updateSettings()
  }

  handleEnableHgvSettings() {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.enableHgvSettings = !controls[controlindex]
      .settings.enableHgvSettings

    this.updateSettings()
  }

  handleHgvSetting(type, value) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.hgv[type] = value

    this.updateSettings()
  }

  alignRangeInterval() {
    const { controls, controlindex } = this.props

    if (
      controls[controlindex].settings.range.value <
        controls[controlindex].settings.interval.value ||
      controls[controlindex].settings.interval.value == ''
    ) {
      controls[controlindex].settings.interval.value =
        controls[controlindex].settings.range.value
    }

    controls[controlindex].settings.interval.max =
      controls[controlindex].settings.range.value
  }

  handleRangeValueChange(e, { value }) {
    const { controls, controlindex } = this.props

    controls[controlindex].settings.range.value = value

    this.alignRangeInterval()
    this.updateSettings()
  }

  handleIntervalValueChange(e, { value }) {
    const { controls, controlindex } = this.props

    if (value <= controls[controlindex].settings.range.value) {
      controls[controlindex].settings.interval.value = value
      this.updateSettings()
    }
  }

  render() {
    const { controls, controlindex } = this.props

    const rangetype =
      controls[controlindex].settings.rangetype === 'time'
        ? ' minut'
        : ' kilometers'

    const rangeSettings = {
      settings: {
        ...controls[controlindex].settings.range,
        start: controls[controlindex].settings.range.value,
        onChange: value => {
          controls[controlindex].settings.range.value = value

          this.alignRangeInterval()
          this.updateSettings()
        }
      }
    }

    const intervalSettings = {
      settings: {
        ...controls[controlindex].settings.interval,
        start: controls[controlindex].settings.interval.value,
        onChange: value => {
          controls[controlindex].settings.interval.value = value

          this.updateSettings()
        }
      }
    }

    const CheckBoxHazardous = ({ ...props }) => {
      return (
        <Checkbox
          value={props.name}
          label={props.name}
          className="pr3 pb2"
          onChange={this.handleHazardousGoods.bind(this)}
          checked={
            controls[controlindex].settings.hgv.shippedHazardousGoods.indexOf(
              props.name
            ) > -1
          }
        />
      )
    }

    const RadioTunnelCategory = ({ ...props }) => {
      return (
        <Radio
          value={props.name}
          label={props.name}
          name="tunnelCategory"
          className="pr3 pb2"
          onChange={this.handleTunnelCategory.bind(this)}
          checked={
            controls[controlindex].settings.hgv.tunnelCategory == props.name
          }
        />
      )
    }

    return (
      <div className="mt3">

        <Accordion>
          <Accordion.Title
            active={this.state.activeIndex === 1}
            index={1}
            onClick={this.handleClickAccordion}>
            <Icon name="dropdown" />
            <Label size="small" color="blue">
              {'Środek transportu'}
            </Label>
          </Accordion.Title>
          <Accordion.Content active={this.state.activeIndex === 1}>
            <div className="mt3">
              <div>
                <Button.Group basic size="small">
                  {transportModes &&
                    Object.keys(transportModes).map((key, i) => (
                      <Button
                        active={key === controls[controlindex].settings.mode}
                        key={i}
                        mode={key}
                        onClick={() => this.handleClickMode(key)}>
                        {key}
                      </Button>
                    ))}
                </Button.Group>
              </div>
              <Divider />
              {(controls[controlindex].settings.mode == 'truck' ||
                controls[controlindex].settings.mode == 'car') && (
                <div>
                  <Divider />
                  <div>
                    <Label size="small">{'Ruch miejski'}</Label>
                    <div className="mt3">
                      <Button.Group basic size="small">
                        <Button
                          active={
                            controls[controlindex].settings.traffic == 'enabled'
                          }
                          key={'enabled'}
                          onClick={() => this.handleClickTraffic('enabled')}>
                          {'włączony'}
                        </Button>
                        <Button
                          active={
                            controls[controlindex].settings.traffic ==
                            'wyłączony'
                          }
                          key={'disabled'}
                          onClick={() => this.handleClickTraffic('disabled')}>
                          {'wyłączony'}
                        </Button>
                      </Button.Group>
                    </div>
                  </div>
                  <Divider />
                  
                </div>
              )}
              {controls[controlindex].settings.mode == 'truck' && (
                <div>
                  <Divider />
                  <Label size="small">{'Ustawienia przejazdu'}</Label>
                  <div className="mt3">
                    <div>
                      <Checkbox
                        slider
                        onChange={() => {
                          this.handleEnableHgvSettings()
                        }}
                      />
                    </div>
                  </div>
                  {controls[controlindex].settings.enableHgvSettings && (
                    <div>
                      <div>
                        <Label size="small">{'Wysokość (w metrach)'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={controls[controlindex].settings.hgv.height}
                            inverted={false}
                            settings={{
                              start: controls[controlindex].settings.hgv.height,
                              min: 0,
                              max: 50,
                              step: 1,
                              onChange: value => {
                                this.handleHgvSetting('height', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <Label className="mt2" color="grey" size={'mini'}>
                              {controls[controlindex].settings.hgv.height}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Szerokość (w metrach)'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={controls[controlindex].settings.hgv.width}
                            inverted={false}
                            settings={{
                              start: controls[controlindex].settings.hgv.width,
                              min: 0,
                              max: 50,
                              step: 1,
                              onChange: value => {
                                this.handleHgvSetting('width', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <Label className="mt2" color="grey" size={'mini'}>
                              {controls[controlindex].settings.hgv.height}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Długość (w metrach)'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={controls[controlindex].settings.hgv.length}
                            inverted={false}
                            settings={{
                              start: controls[controlindex].settings.hgv.length,
                              min: 0,
                              max: 300,
                              step: 1,
                              onChange: value => {
                                this.handleHgvSetting('length', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <Label className="mt2" color="grey" size={'mini'}>
                              {controls[controlindex].settings.hgv.length}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Waga (w tonach)'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={controls[controlindex].settings.hgv.weight}
                            inverted={false}
                            settings={{
                              start: controls[controlindex].settings.hgv.weight,
                              min: 0,
                              max: 1000,
                              step: 10,
                              onChange: value => {
                                this.handleHgvSetting('weight', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <Label className="mt2" color="grey" size={'mini'}>
                              {controls[controlindex].settings.hgv.weight}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Nacisk na oś (tona)'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={
                              controls[controlindex].settings.hgv.weightPerAxle
                            }
                            inverted={false}
                            settings={{
                              start:
                                controls[controlindex].settings.hgv
                                  .weightPerAxle,
                              min: 0,
                              max: 1000,
                              step: 10,
                              onChange: value => {
                                this.handleHgvSetting('weightPerAxle', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <Label className="mt2" color="grey" size={'mini'}>
                              {
                                controls[controlindex].settings.hgv
                                  .weightPerAxle
                              }
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Ilość przyczep'}</Label>
                        <div className="mt3">
                          <Slider
                            discrete
                            color="grey"
                            value={
                              controls[controlindex].settings.hgv.trailersCount
                            }
                            inverted={false}
                            settings={{
                              start:
                                controls[controlindex].settings.hgv
                                  .trailersCount,
                              min: 0,
                              max: 4,
                              step: 1,
                              onChange: value => {
                                this.handleHgvSetting('trailersCount', value)
                              }
                            }}
                          />
                          <div className="mt2">
                            <div className="mt2">
                              <Label className="mt2" color="grey" size={'mini'}>
                                {
                                  controls[controlindex].settings.hgv
                                    .trailersCount
                                }
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Hazardous Goods'}</Label>
                        <div className="mt3">
                          <CheckBoxHazardous name="explosive" />
                          <CheckBoxHazardous name="gas" />
                          <CheckBoxHazardous name="flammable" />
                          <CheckBoxHazardous name="combustible" />
                          <CheckBoxHazardous name="organic" />
                          <CheckBoxHazardous name="poison" />
                          <CheckBoxHazardous name="radioActive" />
                          <CheckBoxHazardous name="corrosive" />
                          <CheckBoxHazardous name="poisonousInhalation" />
                          <CheckBoxHazardous name="harmfulToWater" />
                          <CheckBoxHazardous name="other" />
                        </div>
                      </div>
                      <Divider />
                      <div>
                        <Label size="small">{'Tunnel category'}</Label>
                        <div className="mt3">
                          <RadioTunnelCategory name="B" />
                          <RadioTunnelCategory name="C" />
                          <RadioTunnelCategory name="D" />
                          <RadioTunnelCategory name="E" />
                          <Button
                            basic
                            size="mini"
                            onClick={() => this.clearTunnelCategory()}>
                            {'Clear'}
                          </Button>
                        </div>
                      </div>
                      <Divider />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Accordion.Content>
        </Accordion>
        <Divider />
        <div>
              <Label size="small">{'Maksymalny zasięg'}</Label>
              <div className="mt3">
                <Slider
                  discrete
                  color="grey"
                  value={controls[controlindex].settings.range.value}
                  inverted={false}
                  settings={rangeSettings.settings}
                />
                <div className="mt2 flex justify-between items-center">
                  <Input
                    size="mini"
                    placeholder="Wprowadź wartość..."
                    onChange={this.handleRangeValueChange.bind(this)}
                  />
                  <Label className="mt2" color="grey" size={'mini'}>
                    {controls[controlindex].settings.range.value + rangetype}
                  </Label>
                </div>
              </div>
            </div>
            <Divider />
            <div>
              <Label size="small">{'Interwał czasowy'}</Label>
              <div className="mt3">
                <Slider
                  discrete
                  color="grey"
                  value={controls[controlindex].settings.interval.value}
                  inverted={false}
                  settings={intervalSettings.settings}
                />
                <div className="mt2 flex justify-between items-center">
                  <Input
                    size="mini"
                    placeholder="Wprowadź wartość..."
                    onChange={this.handleIntervalValueChange.bind(this)}
                  />
                  <Label className="mt2" color="grey" size={'mini'}>
                    {controls[controlindex].settings.interval.value + rangetype}
                  </Label>
                </div>
              </div>
            </div>
      </div>
      
    )
  }
}

const mapStateToProps = state => {
  const { controls } = state.isochronesControls
  return {
    controls
  }
}

export default connect(mapStateToProps)(Settings)

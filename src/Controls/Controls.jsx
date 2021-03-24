import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Segment,
  Button,
  Popup,
  Input,
  Modal,
  Image,
  Header,
  Divider
} from 'semantic-ui-react'
import SearchControl from './SearchControl'
import { addIsochronesControl } from '../actions/actions'
import { setAppId, setAppCode } from '../actions/hereconfig'
import dataConfig from '../config.json'

const segmentStyle = {
  zIndex: 999,
  position: 'absolute',
  width: '400px',
  top: '10px',
  left: '10px',
  maxHeight: 'calc(100vh)',
  padding: '0px'
}

class Controls extends React.Component {
  constructor(props) {
    super(props)
    this.handleAddIsochronesControl = this.handleAddIsochronesControl.bind(this)
    this.state = {
      settingsOpen: false
    }
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    controls: PropTypes.array.isRequired,
    hereConfig: PropTypes.object.isRequired
  }

  openSettings = () => this.setState({ settingsOpen: true })
  closeSettings = () => this.setState({ settingsOpen: false })

  handleAddIsochronesControl = () => {
    this.props.dispatch(addIsochronesControl())
  }

  handleAppIdChange = event => {
    const { dispatch } = this.props
    dispatch(setAppId(event.target.value))
  }

  handleAppCodeChange = event => {
    const { dispatch } = this.props
    dispatch(setAppCode(event.target.value))
  }

  render() {
    const { controls, hereConfig } = this.props
    const { settingsOpen } = this.state
    return (
      <div>
        <Segment className="flex flex-column" style={segmentStyle}>
          <div>
            <div style={{ flex: 1, display: 'flex', minHeight: '0px' }}>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <div
                  style={{
                    maxHeight: 'calc(100vh - 7vw)',
                    overflow: 'auto'
                  }}>
                  {controls &&
                    controls.map((object, i) => (
                      <SearchControl key={i} controlindex={i} />
                    ))}
                  <div
                    style={{
                      marginLeft: '20px',
                      marginBottom: '20px',
                      marginTop: '0px'
                    }}>
                    <Popup
                      trigger={
                        <Button
                          circular
                          icon="plus"
                          className="ma3"
                          onClick={this.handleAddIsochronesControl}
                        />
                      }
                      content="Dodaj izochronę"
                      size="mini"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Segment>
     </div>
    )
  }
}

const mapStateToProps = state => {
  const { controls } = state.isochronesControls
  const hereConfig = state.hereConfig
  return {
    controls,
    hereConfig
  }
}

export default connect(mapStateToProps)(Controls)

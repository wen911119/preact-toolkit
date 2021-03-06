import { h, Component } from 'preact'
import Input from '@ruiyun/preact-input'
import { SlotRowView } from '@ruiyun/preact-layout-suite'
import Line from '@ruiyun/preact-line'
import Indicator from 'h5-indicator'
import { CountDownTextButton } from '@ruiyun/preact-countdown'
import FormRow from './formRow'

export default class CaptchInput extends Component {
  state = {
    session: ''
  }

  preflightCheck = async () => {
    const {
      preflightCheck,
      linkData,
      sendCode,
      regexp,
      suffix = '手机号'
    } = this.props
    let result = true
    if (linkData) {
      if (regexp.test(linkData)) {
        if (preflightCheck) {
          // 父级自定义preflightCheck,比如人机校验
          result = await preflightCheck()
        }
        if (result) {
          const session = await sendCode(linkData)
          if (session) {
            this.setState({
              session
            })
          } else {
            result = false
          }
        }
      } else {
        result = false
        Indicator.toast('请输入正确的' + suffix)
      }
    } else {
      result = false
      Indicator.toast('请先填写' + suffix)
    }
    return result
  }

  onChange = event => {
    this.props.sync({
      session: this.state.session,
      code: event.target.value
    })
  }

  renderRight = () => {
    const {
      count,
      text,
      textSize,
      textColor,
      countdownHeight = 45,
      splitLineColor = '#ccc',
      splitSlot = 30
    } = this.props
    return (
      <SlotRowView height={countdownHeight} slot={splitSlot}>
        <Line v color={splitLineColor} />
        <CountDownTextButton
          count={count}
          text={text}
          textSize={textSize}
          textColor={textColor}
          preflightCheck={this.preflightCheck}
        />
      </SlotRowView>
    )
  }

  render() {
    const {
      label,
      err,
      style,
      required,
      padding,
      labelSize,
      labelColor,
      errorSize,
      errorColor,
      direction,
      slot,
      value,
      ...otherProps
    } = this.props
    return (
      <FormRow
        label={label}
        err={err}
        direction={direction}
        required={required}
        padding={padding}
        labelSize={labelSize}
        labelColor={labelColor}
        errorSize={errorSize}
        errorColor={errorColor}
        slot={slot}
        renderRight={this.renderRight}
      >
        <Input
          {...otherProps}
          value={value && value.code}
          onChange={this.onChange}
          height='0.6rem'
          width='100%'
          style={Object.assign(
            {
              textAlign: direction === 'v' ? 'left' : 'right',
              lineHeight: '0.6rem'
            },
            style
          )}
        />
      </FormRow>
    )
  }
}

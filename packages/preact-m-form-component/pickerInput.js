import { h, Component } from 'preact'
import { WithPicker } from '@ruiyun/preact-m-picker'
import Text from '@ruiyun/preact-text'
import FormRow from './formRow'

const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

@WithPicker
export default class FormPickerInput extends Component {
  onClick = async () => {
    const {
      title = '请选择',
      config,
      sync,
      mode,
      value = [],
      getOptions,
      linkData,
      preflightCheck
    } = this.props
    if (preflightCheck && !preflightCheck(linkData)) {
      return
    }
    if (getOptions) {
      this.options = await getOptions(linkData)
    }
    const selectedIndexs = value.map(v =>
      this.options.findIndex(
        option => this.labelExtractor(v) === this.labelExtractor(option)
      )
    )
    this.props
      .$picker({
        title,
        options: this.options.map(this.labelExtractor),
        config,
        mode,
        values: selectedIndexs
      })
      .then(indexs => {
        sync(indexs.map(index => this.options[index]))
      })
  }

  constructor(props) {
    super(props)
    this.labelExtractor = props.labelExtractor || (v => v)
    this.options = props.options || []
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.linkData, this.props.linkData)) {
      this.props.sync()
    }
  }

  render() {
    const {
      label,
      err,
      placeholder,
      textColor = '#666',
      textSize = 30,
      value, // 是数组
      split = ',',
      required,
      padding,
      labelSize,
      labelColor,
      errorSize,
      errorColor,
      direction,
      slot,
      arrowSize,
      arrowColor,
      ...otherProps
    } = this.props
    let valueShow
    if (value && value.length) {
      valueShow = value.map(this.labelExtractor).join(split)
    }
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
        arrowSize={arrowSize}
        arrowColor={arrowColor}
        arrow
      >
        <Text
          {...otherProps}
          color={valueShow ? textColor : '#ccc'}
          size={textSize}
          onClick={this.onClick}
        >
          {valueShow || placeholder || '请选择'}
        </Text>
      </FormRow>
    )
  }
}

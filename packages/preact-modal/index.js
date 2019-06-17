import { h, Component, cloneElement } from 'preact'
import Portal from 'preact-portal'
import animationClass from './index.css'

let animation = true
const us = navigator.userAgent.toLowerCase()
if (us.indexOf('android') > -1) {
  const androidVersion = navigator.userAgent
    .toLowerCase()
    .replace(/.+android\s(\d).+/, '$1')
  if (parseInt(androidVersion, 10) < 6) {
    // 在老旧安卓机器上禁用动画
    animation = false
  }
}

const baseStyle = {
  display: 'flex',
  position: 'fixed',
  zIndex: 100,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  animationDuration: '.3s'
}

function hack (maskClickHander) {
  return function (e) {
    e.target.className.indexOf('_modal_mask_') > -1 &&
      maskClickHander &&
      maskClickHander()
  }
}

export default class ModalStateless extends Component {
  noMove (e) {
    if (
      !(
        this.props.allowContentTouchMove &&
        e.target.className !== '_modal_mask_'
      )
    ) {
      e.preventDefault()
    }
  }
  constructor (props) {
    super(props)
    this.state = {
      close: !props.open
    }
    this.noMove = this.noMove.bind(this)
    this.modalContentStyle = {
      animationDuration: '.3s',
      transition: 'transform .3s'
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.open !== nextProps.open) {
      if (!(this.state.close = nextProps.open)) {
        setTimeout(() => this.setState({ close: true }), 300)
      }
    }
  }
  render = (
    { open, into = 'body', children, onMaskClick, position, mask },
    { close }
  ) => {
    const style = { backgroundColor: `rgba(0,0,0,${mask})` }
    let maskStyle = Object.assign({}, baseStyle, style)
    if (open) {
      maskStyle.animationName = animationClass['modal-mask-fadein']
    }
    else {
      maskStyle.backgroundColor = 'rgba(0,0,0,0)'
    }
    let modalContentStyle = Object.assign({}, this.modalContentStyle)
    if (position === 'center') {
      if (animation) {
        modalContentStyle.animationName = animationClass['modal-content-zoom']
        maskStyle.transition = 'background-color 0.3s linear'
      }

      maskStyle.justifyContent = 'center'
      maskStyle.alignItems = 'center'
      if (!open) {
        maskStyle.transition = 'background-color 0s linear'
        modalContentStyle.display = 'none'
      }
    }
    else if (position === 'left') {
      maskStyle.alignItems = 'center'
      maskStyle.transition = 'background-color .3s easy-out'
      if (open) {
        modalContentStyle.transform = 'translate3d(0px, 0px, 0px)'
        modalContentStyle.animationName = animationClass['modal-content-left-in']
      }
      else {
        modalContentStyle.transform = 'translate3d(-100%, 0px, 0px)'
      }
    }
    else if (position === 'right') {
      maskStyle.alignItems = 'center'
      maskStyle.justifyContent = 'flex-end'
      maskStyle.transition = 'background-color .3s easy-in'
      if (open) {
        modalContentStyle.transform = 'translate3d(0px, 0px, 0px)'
        modalContentStyle.animationName = animationClass['modal-content-right-in']
      }
      else {
        modalContentStyle.transform = 'translate3d(100%, 0px, 0px)'
      }
    }
    else if (position === 'top') {
      maskStyle.alignItems = 'flex-start'
      maskStyle.justifyContent = 'center'
      maskStyle.transition = 'background-color .3s easy-in-out'
      if (open) {
        modalContentStyle.transform = 'translate3d(0px, 0px, 0px)'
        modalContentStyle.animationName = animationClass['modal-content-top-in']
      }
      else {
        modalContentStyle.transform = 'translate3d(0, -100%, 0px)'
      }
    }
    else if (position === 'bottom') {
      maskStyle.alignItems = 'flex-end'
      maskStyle.justifyContent = 'center'
      maskStyle.transition = 'background-color .3s easy-in-out'
      if (open) {
        modalContentStyle.transform = 'translate3d(0px, 0px, 0px)'
        modalContentStyle.animationName = animationClass['modal-content-bottom-in']
      }
      else {
        modalContentStyle.transform = 'translate3d(0, 100%, 0px)'
      }
    }
    // preact-portal 没有适配 Preact X 目前只能多加一个空div来解决
    // https://github.com/developit/preact-portal/issues/19
    return open || !close ? (
      <Portal into={into}>
        <div
          className="_modal_mask_"
          onClick={hack(onMaskClick)}
          onTouchMove={this.noMove}
          style={maskStyle}
        >
          <div style={modalContentStyle}>{children}</div>
        </div>
        <div />
      </Portal>
    ) : null
  }
}

export class Modal extends Component {
  show ({
    content = () => null,
    autoClose = true,
    position = 'center',
    mask = 0.2,
    allowContentTouchMove = false,
    onMaskClick
  }) {
    this.setState({
      open: true,
      content,
      autoClose,
      position,
      mask,
      allowContentTouchMove,
      onMaskClick
    })
  }
  hide () {
    this.setState({ open: false })
  }
  onMaskClick () {
    if (this.state.autoClose) {
      this.hide()
    }
    this.state.onMaskClick && this.state.onMaskClick()
  }
  constructor (props) {
    super(props)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.onMaskClick = this.onMaskClick.bind(this)
    this.$modal = {
      show: this.show,
      hide: this.hide
    }
    this.state = {
      open: false,
      autoClose: true,
      position: 'center',
      content: () => null,
      mask: 0.2,
      allowContentTouchMove: false,
      onMaskClick: null
    }
  }
  render (
    { children },
    { open, content, position, mask, allowContentTouchMove }
  ) {
    const Content = content
    return (
      <div>
        {cloneElement(children, { $modal: this.$modal })}
        <div id="_modal_placeholder_" />
        <ModalStateless
          into="#_modal_placeholder_"
          onMaskClick={this.onMaskClick}
          open={open}
          position={position}
          mask={mask}
          allowContentTouchMove={allowContentTouchMove}
        >
          <Content />
        </ModalStateless>
      </div>
    )
  }
}

export const WithModal = BaseComponent => {
  class ComponentWithModal extends Component {
    render () {
      return (
        <Modal>
          <BaseComponent {...this.props} />
        </Modal>
      )
    }
  }
  return ComponentWithModal
}

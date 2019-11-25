export default function VNode (
  tag, data, children, componentOptions, componentInstance,
) {
  this.tag = tag
  this.data = data
  this.children = children
  this.componentOptions = componentOptions
  this.componentInstance = componentInstance
}

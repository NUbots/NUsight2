import { action } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { ComponentType } from 'react'

export type WrappedComponentProps = {
  onToggle: () => void
}

export const dropdownContainer = (WrappedComponent: ComponentType<any>) => {
  // Refer to: https://github.com/Microsoft/TypeScript/issues/7342
  @observer
  class EnhancedDropdown extends React.Component<any> {
    private dropdown: HTMLDivElement
    @observable private isOpen: boolean = false
    private removeClickListener: () => void

    constructor(props: {}) {
      super(props)
    }

    componentDidMount() {
      const onClick = (event: MouseEvent) => this.onDocumentClick(event)
      document.addEventListener('click', onClick)
      this.removeClickListener = () => {
        document.removeEventListener('click', onClick)
      }
    }

    componentWillUnmount() {
      if (this.removeClickListener) {
        this.removeClickListener()
      }
    }

    public render(): JSX.Element {
      return (
        <WrappedComponent {...this.props}
          isOpen={this.isOpen}
          onRef={this.onRef}
          onToggleClick={this.onToggleClick}>
          {this.props.children}
        </WrappedComponent>
      )
    }

    @action
    private close() {
      if (this.isOpen) {
        this.isOpen = false
      }
    }

    private onDocumentClick(event: MouseEvent) {
      if (!this.dropdown) {
        return
      }

      const isOutsideEl = (target: EventTarget, el?: HTMLElement): boolean => {
        let current: Node | null = target as Node
        while (current) {
          if (current === el) {
            return false
          }
          current = current.parentNode
        }
        return true
      }
      if (this.isOpen && isOutsideEl(event.target, this.dropdown)) {
        this.close()
      }
    }

    private onRef = (dropdown: HTMLDivElement) => {
      this.dropdown = dropdown
    }

    private onToggleClick = () => {
      this.toggle()
    }

    @action
    private open() {
      if (!this.isOpen) {
        this.isOpen = true
      }
    }

    @action
    private toggle() {
      this.isOpen = !this.isOpen
    }
  }

  return EnhancedDropdown
}

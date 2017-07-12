import { action } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { CSSProperties } from 'react'
import { ComponentType } from 'react'
import { ReactNode } from 'react'
import { DropdownProps } from '../dropdown/view'
import { Dropdown } from '../dropdown/view'

export type DropdownContainerProps = {
  dropdownMenuStyle?: CSSProperties
  dropdownToggle: ReactNode
}

export const dropdownContainer = (WrappedComponent: ComponentType<DropdownProps> = Dropdown) => {
  // Refer to: https://github.com/Microsoft/TypeScript/issues/7342
  @observer
  class EnhancedDropdown extends React.Component<DropdownContainerProps> {
    private dropdown: HTMLDivElement
    @observable private isOpen: boolean = false
    private removeClickListener: () => void

    public componentDidMount() {
      const onClick = (event: MouseEvent) => this.onDocumentClick(event)
      document.addEventListener('click', onClick)
      this.removeClickListener = () => {
        document.removeEventListener('click', onClick)
      }
    }

    public componentWillUnmount() {
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

function isOutsideEl(target: EventTarget, el?: HTMLElement): boolean {
  let current: Node | null = target as Node
  while (current) {
    if (current === el) {
      return false
    }
    current = current.parentNode
  }
  return true
}

import * as classNames from 'classnames'
import { action } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { ReactNode } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { Dropdown } from '../dropdown/view'

import DropdownIcon from './dropdown.svg'
import * as style from './style.css'

export interface SelectOption {
  id: string | number
  label: string
}

export type SelectProps = {
  placeholder: string
  options: SelectOption[]
  selectedOption?: SelectOption
  className?: string
  dropdownMenuClassName?: string
  icon?: ReactNode
  empty?: ReactNode
  onChange(option: SelectOption): void
}

enum KeyCode {
  Escape = 27,
}

@observer
export class Select extends React.Component<SelectProps> {
  @observable
  private isOpen: boolean = false
  private removeListeners?: () => void

  componentDidMount() {
    const onKeydown = (event: KeyboardEvent) => this.onDocumentKeydown(event)
    document.addEventListener('keydown', onKeydown)

    this.removeListeners = () => {
      document.removeEventListener('keydown', onKeydown)
    }
  }

  componentWillUnmount() {
    if (this.removeListeners) {
      this.removeListeners()
    }
  }

  render(): JSX.Element {
    const { className, dropdownMenuClassName, icon, placeholder, empty, options, selectedOption } = this.props

    const button = (
      <button className={style.button}>
        { icon && <span className={style.buttonIcon}>{ icon }</span> }
        { selectedOption ? selectedOption.label : placeholder }
        <DropdownIcon className={style.dropdownIcon}/>
      </button>
    )

    return (
      <OutsideClickHandler onOutsideClick={() => this.close()}>
        <Dropdown
          className={className}
          dropdownMenuClassName={classNames([style.dropdown, dropdownMenuClassName])}
          dropdownToggle={button}
          isOpen={this.isOpen}
          onToggleClick={this.onToggleClick}
        >
          { options.length === 0 && <div className={style.empty}>{ empty || 'No options' }</div> }
          { options.length > 0 && <div className={style.options}>{
              options.map(option => {
                const optionClassName = selectedOption && selectedOption.id === option.id ? style.optionSelected : ''
                return <div
                  className={classNames([style.option, optionClassName])}
                  key={option.id}
                  onClick={() => this.onSelect(option)}
                >{ option.label }</div>
              })
            }</div>
          }
        </Dropdown>
      </OutsideClickHandler>
    )
  }

  private onToggleClick = () => {
    this.toggle()
  }

  private onSelect = (option: SelectOption) => {
    this.props.onChange && this.props.onChange(option)
    this.close()
  }

  private onDocumentKeydown(event: KeyboardEvent) {
    if (this.isOpen && event.keyCode === KeyCode.Escape) {
      this.close()
    }
  }

  @action
  private open() {
    if (!this.isOpen) {
      this.isOpen = true
    }
  }

  @action
  private close() {
    if (this.isOpen) {
      this.isOpen = false
    }
  }

  @action
  private toggle() {
    this.isOpen = !this.isOpen
  }
}

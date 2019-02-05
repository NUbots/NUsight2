import * as classNames from 'classnames'
import { action } from 'mobx'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as React from 'react'
import { ReactNode } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { Dropdown } from '../dropdown/view'

import DropdownIcon from './dropdown.svg'
import { SelectOption } from './option'
import * as style from './style.css'

export interface Option {
  id: string | number
  label: string
}

export type SelectProps = {
  className?: string
  dropdownMenuClassName?: string
  placeholder: string
  options: Option[]
  selectedOption?: Option
  icon?: ReactNode
  empty?: ReactNode
  onChange(option: Option): void
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
    document.addEventListener('keydown', this.onDocumentKeydown)

    this.removeListeners = () => {
      document.removeEventListener('keydown', this.onDocumentKeydown)
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

    return <OutsideClickHandler onOutsideClick={this.close}>
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
              const isSelected = Boolean(selectedOption && selectedOption.id === option.id)
              return <SelectOption
                key={option.id}
                option={option}
                isSelected={isSelected}
                onSelect={this.onSelect}
              />
            })
          }</div>
        }
      </Dropdown>
    </OutsideClickHandler>
  }

  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (this.isOpen && event.keyCode === KeyCode.Escape) {
      this.close()
    }
  }

  @action.bound
  private onToggleClick() {
    this.toggle()
  }

  @action.bound
  private onSelect(option: Option) {
    this.props.onChange && this.props.onChange(option)
    this.close()
  }

  @action.bound
  private open() {
    if (!this.isOpen) {
      this.isOpen = true
    }
  }

  @action.bound
  private close() {
    if (this.isOpen) {
      this.isOpen = false
    }
  }

  @action.bound
  private toggle() {
    this.isOpen = !this.isOpen
  }
}

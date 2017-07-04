import * as classNames from 'classnames'
import * as React from 'react'
import * as style from './style.css'
import DropdownIcon from './dropdown.svg'

export interface SelectOption {
  label: string
  value: string
  data?: any
}

export interface SelectProps {
  options: SelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  onChange: (selectedOption: SelectOption) => void
}

interface SelectState {
  open: boolean
  focused: boolean
  selectedLabel: null | string
  selectedValue: null | string
}

export class Select extends React.Component<SelectProps> {
  public state: SelectState
  public props: SelectProps
  public selectContainer: HTMLDivElement

  public constructor(props: SelectProps, context: any) {
    super(props, context)

    this.state = {
      open: false,
      focused: false,
      selectedLabel: null,
      selectedValue: null,
    }

    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.handleExternalClick = this.handleExternalClick.bind(this)
  }

  public render(): JSX.Element {
    const classes = classNames(style.select, {
      [style.selectOpen]: this.state.open,
      [style.selectFocused]: this.state.focused,
      [style.selectDisabled]: Boolean(this.props.disabled)
    })

    return (
      <div className={classes}>
        { this.props.label &&
          <div className={style.selectLabel}>{ this.props.label }</div>
        }

        <div className={style.selectContainer} ref={(input: HTMLDivElement) => {this.selectContainer = input}}>
          <div className={style.selectInput} onClick={this.toggleDropdown}>
            { this.state.selectedLabel === null
              ? <div className={style.selectPlaceholder}>{ this.props.placeholder || 'Select an option' }</div>
              : <div className={style.selectValue}>{ this.state.selectedLabel }</div>
            }
            <DropdownIcon className={style.selectDropdownIcon} />
          </div>

          <div className={style.selectDropdown}>
            <ul className={style.selectDropdownList}>
              {
                this.props.options.map((option, index) => {
                  const classes = classNames(style.selectDropdownItem, {
                    [style.selectDropdownItemSelected]: option.value === this.state.selectedValue
                  })

                  return <li className={classes} key={index} onClick={() => {this.selectOption(option)}}>
                    { option.label }
                  </li>
                })
              }
            </ul>
          </div>
        </div>
      </div>
    )
  }

  public componentDidMount(): void | undefined {
    document.addEventListener('click', this.handleExternalClick)
  }

  public componentWillUnmount(): void | undefined {
    document.removeEventListener('click', this.handleExternalClick)
  }

  private handleExternalClick(event: MouseEvent): void {
    if (this.selectContainer.contains(event.target as Node) || !this.state.focused) {
      return
    }

    this.setState({
      open: this.state.open ? false : this.state.open,
      focused: false,
    })
  }

  private toggleDropdown(event: any): void {
    if (this.props.disabled) {
      return
    }

    this.setState({
      open: !this.state.open,
      focused: true
    })
  }

  private selectOption(option: SelectOption) {
    this.setState({
      selectedLabel: option.label,
      selectedValue: option.value,
      open: false
    })

    this.props.onChange(option)
  }
}

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'vtex.styleguide'

export const LAYOUT_MODES = [
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'small',
    label: 'Small',
  },
  {
    value: 'inline',
    label: 'Inline',
  },
  {
    value: 'list',
    label: 'List',
  },
]

const LayoutModeSelector = ({ activeMode, onChange }) => {
  return (
    <Dropdown
      variation="tertiary"
      options={LAYOUT_MODES}
      value={activeMode}
      onChange={e => onChange(e)}
    />
  )
}

LayoutModeSelector.propTypes = {
  /** Current active mode */
  activeMode: PropTypes.string,
  /** On change callback */
  onChange: PropTypes.func.isRequired,
}

export default LayoutModeSelector

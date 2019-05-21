import classNames from 'classnames'
import React from 'react'

import styles from './searchResult.css'

const SearchTitle = ({ title }) => {
  if (!title) {
    return null
  }

  return (
    <h1 className={classNames(styles.galleryTitle, 't-heading-1')}>
      {decodeURI(title)}
    </h1>
  )
}

export default SearchTitle

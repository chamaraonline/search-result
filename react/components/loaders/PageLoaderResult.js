import React from 'react'
import { Pagination } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import SearchResult from '../SearchResult'
import { loaderPropTypes } from '../../constants/propTypes'

import searchResult from '../../searchResult.css'
import { withRuntimeContext } from 'vtex.render-runtime'
import queryString from 'query-string'

class PageLoaderResult extends React.Component {
  nextClick = () => {
    const { onFetchMore, maxItemsPerPage, paging } = this.props

    return onFetchMore({
      from: paging._to + 1,
      to: paging._to + maxItemsPerPage,
      page: paging.page + 1,
    })
  }

  rowsClick = (e, value) => {
    const { onFetchMore } = this.props
    this.setState({ itemsPerPage: parseInt(value) })
    return onFetchMore({
      from: 0,
      to: value - 1,
      page: 1,
    })
  }

  previousClick = e => {
    const { onFetchMore, maxItemsPerPage, paging } = this.props
    return onFetchMore({
      from: paging._from - maxItemsPerPage,
      to: paging._to - maxItemsPerPage,
      page: paging.page - 1,
    })
  }

  updateUrl = paging => {
    const parsed = queryString.parse(location.search)

    if (!paging.page || parsed.page == paging.page) {
      return null
    }

    parsed.page = paging.page
    window.history.pushState(
      parsed,
      'PageParams',
      location.pathname + '?' + queryString.stringify(parsed)
    )
  }

  render() {
    const { recordsFiltered, paging } = this.props

    this.updateUrl(paging)

    return (
      <SearchResult {...this.props}>
        <div
          className={`${searchResult.buttonShowMore} w-100 flex justify-center`}
        >
          <div>
            <Pagination
              currentItemFrom={paging._from + 1}
              currentItemTo={paging._to + 1}
              textOf="of"
              textShowRows="show rows"
              totalItems={recordsFiltered}
              onNextClick={this.nextClick}
              onPrevClick={this.previousClick}
              onRowsChange={this.rowsClick}
            />
          </div>
        </div>
      </SearchResult>
    )
  }
}

PageLoaderResult.propTypes = loaderPropTypes

export default withRuntimeContext(PageLoaderResult)

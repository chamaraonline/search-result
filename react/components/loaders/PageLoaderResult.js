import React from 'react'
import { Button, Pagination } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'

import SearchResult from '../SearchResult'
import { loaderPropTypes } from '../../constants/propTypes'

import searchResult from '../../searchResult.css'
import { ExtensionPoint, withRuntimeContext } from 'vtex.render-runtime'

/**
 * Search Result Component.
 */
class PageLoaderResult extends React.Component {
  state = {
    from: 0,
    to: 0,
    page: 1,
    itemsPerPage: 0,
  }

  setStateWithPageParams(pageData) {
    this.setState({ from: pageData.from })
    this.setState({ to: pageData.to })
    this.setState({ page: pageData.page })

    return pageData
  }

  nextClick = () => {
    const { onFetchMore, maxItemsPerPage } = this.props
    const { itemsPerPage } = this.state
    const pageSize = itemsPerPage !== 0 ? itemsPerPage : maxItemsPerPage
    const nextFrom = this.state.page !== 1 ? this.state.to + 1 : pageSize
    const nextTo =
      this.state.page !== 1 ? this.state.to + pageSize : pageSize * 2 - 1

    return onFetchMore(
      this.setStateWithPageParams({
        from: nextFrom,
        to: nextTo,
        page: this.page + 1,
      })
    )
  }

  rowsClick = (e, value) => {
    const { onFetchMore } = this.props
    this.setState({ itemsPerPage : parseInt(value)})
    return onFetchMore(
      this.setStateWithPageParams({
        from: 0,
        to: value - 1,
        page: 1,
      })
    )
  }

  previousClick = e => {
    const { onFetchMore, maxItemsPerPage } = this.props
    const { itemsPerPage } = this.state
    const pageSize = itemsPerPage !== 0 ? itemsPerPage : maxItemsPerPage
    return onFetchMore(
      this.setStateWithPageParams({
        from: this.state.from - pageSize,
        to: this.state.to - pageSize,
        page: this.state.page - 1,
      })
    )
  }

  // componentDidMount() {
  //   const { onFetchMore, maxItemsPerPage } = this.props

  //   return onFetchMore(
  //     this.setStateWithPageParams({
  //       from: 0,
  //       to: maxItemsPerPage - 1,
  //       page: 1,
  //     })
  //   )
  // }

  render() {
    const { maxItemsPerPage, recordsFiltered } = this.props    
    const { itemsPerPage } = this.state
    const pageSize = itemsPerPage !== 0 ? itemsPerPage : maxItemsPerPage

    return (
      <SearchResult {...this.props}>
        <div
          className={`${searchResult.buttonShowMore} w-100 flex justify-center`}
        >
          <div>
            <Pagination
              rowsOptions={[5, 10, 15, 20]}
              currentItemFrom={this.state.from + 1}
              currentItemTo={
                this.state.page === 1 ? pageSize : this.state.to + 1
              }
              textOf="de"
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

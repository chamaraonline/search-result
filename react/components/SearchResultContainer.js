import React, { useState, useRef } from 'react'
import { min } from 'ramda'

import { Container } from 'vtex.store-components'

import { PopupProvider } from './Popup'
import InfiniteScrollLoaderResult from './loaders/InfiniteScrollLoaderResult'
import ShowMoreLoaderResult from './loaders/ShowMoreLoaderResult'
import { searchResultContainerPropTypes } from '../constants/propTypes'
import PageLoaderResult from './loaders/PageLoaderResult'

const SHOW_MORE_BUTTON_PAGINATION = 'show-more'
const INFINITE_SCROLL_PAGINATION = 'infinite-scroll'
const PAGE_BY_PAGE_PAGINATION = 'page-by-page'

const PAGINATION_TYPES = {
  'show-more': ShowMoreLoaderResult,
  'infinite-scroll': InfiniteScrollLoaderResult,
  'page-by-page': PageLoaderResult,
}

const categoryWithChildrenReducer = (acc, category) => [
  ...acc,
  category,
  ...category.children,
]

const getBreadcrumbsProps = ({
  category,
  department,
  term,
  categoriesTrees,
  loading,
}) => {
  const params = {
    term: term ? decodeURIComponent(term) : term,
  }

  if (loading || !categoriesTrees) {
    return params
  }

  if (department && category) {
    params.categoryTree = categoriesTrees.reduce(
      categoryWithChildrenReducer,
      []
    )
  } else if (department) {
    params.categoryTree = categoriesTrees
  }

  return params
}

/**
 * Search Result Container Component.
 */
const SearchResultContainer = props => {
  const {
    params,
    showMore = false,
    maxItemsPerPage = 3,
    searchQuery: {
      fetchMore,
      data: {
        facets: {
          brands = [],
          specificationFilters = [],
          priceRanges = [],
          categoriesTrees,
          recordsFiltered: facetRecordsFiltered,
        } = {},
        productSearch: { products = [], recordsFiltered } = {},
      } = {},
      loading,
      variables: { query },
    },
    pagination
  } = props

  const [fetchMoreLoading, setFetchMoreLoading] = useState(false)

  const fetchMoreLocked = useRef(false)

  const handleFetchMore = (pageData) => {
    if (fetchMoreLocked.current || products.length === 0) {
      return
    }

    fetchMoreLocked.current = true
    const from = pageData? pageData.from: products.length
    const to = pageData? pageData.to: min(maxItemsPerPage + products.length, recordsFiltered) - 1

    setFetchMoreLoading(true)

    fetchMore({
      variables: {
        from: from,
        to,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        setFetchMoreLoading(false)
        fetchMoreLocked.current = false

        // backwards compatibility
        if (prevResult.search) {
          return {
            search: {
              ...prevResult.search,
              products: [
                ...prevResult.search.products,
                ...fetchMoreResult.search.products,
              ],
            },
          }
        }
        const products =
          PAGE_BY_PAGE_PAGINATION === pagination
            ? fetchMoreResult.productSearch.products
            : [
                ...prevResult.productSearch.products,
                ...fetchMoreResult.productSearch.products,
              ]
        
        prevResult.productSearch.products.length = 0

        return {
          ...prevResult,
          productSearch: {
            ...prevResult.productSearch,
            products: products,
          },
        }
      },
    })
  }

  const ResultComponent = PAGINATION_TYPES[pagination]
    ? PAGINATION_TYPES[pagination]
    : InfiniteScrollLoaderResult

  return (
    <Container className="pt3-m pt5-l">
      <PopupProvider>
        <div id="search-result-anchor" />
        <ResultComponent
          {...props}
          showMore={showMore}
          breadcrumbsProps={getBreadcrumbsProps(
            Object.assign({}, params, { categoriesTrees, loading })
          )}
          onFetchMore={handleFetchMore}
          fetchMoreLoading={fetchMoreLoading}
          query={query}
          loading={loading}
          recordsFiltered={recordsFiltered}
          facetRecordsFiltered={facetRecordsFiltered}
          products={products}
          brands={brands}
          specificationFilters={specificationFilters}
          priceRanges={priceRanges}
          tree={categoriesTrees}
        />
      </PopupProvider>
    </Container>
  )
}

SearchResultContainer.propTypes = searchResultContainerPropTypes

export default SearchResultContainer

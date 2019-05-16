import React, { Component, Fragment } from 'react'
import { Spinner } from 'vtex.styleguide'
import { ExtensionPoint, withRuntimeContext } from 'vtex.render-runtime'

import LoadingOverlay from './LoadingOverlay'
import { searchResultPropTypes } from '../constants/propTypes'
import LayoutModeSwitcher, { LAYOUT_MODE } from './LayoutModeSwitcher'

import styles from '../searchResult.css'

/**
 * Search Result Component.
 */
class SearchResult extends Component {
  static propTypes = searchResultPropTypes

  static defaultProps = {
    mobileLayout: {
      mode1: LAYOUT_MODE[0].value,
      mode2: LAYOUT_MODE[1].value,
    },
  }

  state = {
    mobileLayoutMode: this.props.mobileLayout.mode1,
    showLoadingAsOverlay: false,
    // The definitions bellow are required because
    // on SSR the getDerivedStateFromProps isn't called
    products: this.props.products,
    recordsFiltered: this.props.recordsFiltered,
    facetRecordsFiltered: this.props.facetRecordsFiltered,
    brands: this.props.brands,
    map: this.props.map,
    params: this.props.params,
    priceRange: this.props.priceRange,
    priceRanges: this.props.priceRanges,
    specificationFilters: this.props.specificationFilters,
    tree: this.props.tree,
    hiddenFacets: this.props.hiddenFacets,
  }

  handleMobileLayoutChange = e => {
    e.preventDefault()

    const modes = [this.props.mobileLayout.mode1, this.props.mobileLayout.mode2]
    const modeIndex = (modes.indexOf(this.state.mobileLayoutMode) + 1) % 2
    const currentMode = modes[modeIndex]

    this.setState({
      mobileLayoutMode: currentMode,
    })
  }

  static getDerivedStateFromProps(props) {
    // Do not use the props when the query is loading
    // so we can show the previous products when the
    // overlay is on the screen
    if (!props.loading) {
      if (!props.mobileLayout.mode1 && !props.mobileLayout.mode2) {
        props.mobileLayout.mode1 = LAYOUT_MODE[0].value
        props.mobileLayout.mode2 = LAYOUT_MODE[1].value
      }

      const {
        products,
        recordsFiltered,
        facetRecordsFiltered,
        brands,
        map,
        params,
        priceRange,
        priceRanges,
        specificationFilters,
        tree,
        hiddenFacets,
      } = props

      return {
        products,
        recordsFiltered,
        facetRecordsFiltered,
        brands,
        map,
        params,
        priceRange,
        priceRanges,
        specificationFilters,
        tree,
        hiddenFacets,
      }
    }

    return null
  }

  componentDidMount() {
    if (!this.props.loading) {
      this.setState({
        showLoadingAsOverlay: true,
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading && !this.props.loading) {
      this.setState({
        showLoadingAsOverlay: true,
      })
    }
  }

  render() {
    const {
      children,
      breadcrumbsProps,
      loading,
      fetchMoreLoading,
      summary,
      orderBy,
      showCategoryPanel,
      showFacetQuantity,
      runtime: {
        hints: { mobile },
      },
      quantityOfItemsPerRow,
    } = this.props
    const {
      mobileLayoutMode,
      recordsFiltered,
      facetRecordsFiltered,
      products = [],
      brands,
      map,
      params,
      priceRange,
      priceRanges,
      specificationFilters,
      tree,
      hiddenFacets,
      showLoadingAsOverlay,
    } = this.state

    const term =
      params && params.term ? decodeURIComponent(params.term) : undefined

    // only show the not found page if the reason for it
    // isn't because of some applied filter, but that we
    // *really* don't have any products to show for the
    // current query
    if (facetRecordsFiltered === 0 && !loading) {
      return <ExtensionPoint id="not-found" term={term} />
    }

    const hideFacets = !map || !map.length
    const showLoading = loading && !fetchMoreLoading
    const showContentLoader = showLoading && !showLoadingAsOverlay

    return (
      <LoadingOverlay loading={showLoading && showLoadingAsOverlay}>
        <div className={`${styles.container} w-100 mw9`}>
          {!mobile && (
            <div className={styles.breadcrumb}>
              <ExtensionPoint id="breadcrumb" {...breadcrumbsProps} />
            </div>
          )}
          <ExtensionPoint
            id="search-title"
            params={params}
            map={map}
            products={products}
          />
          <ExtensionPoint
            id="total-products"
            recordsFiltered={recordsFiltered}
          />
          {!hideFacets && (
            <ExtensionPoint
              id="filter-navigator"
              brands={brands}
              showFilters={!!map}
              params={params}
              priceRange={priceRange}
              priceRanges={priceRanges}
              specificationFilters={specificationFilters}
              tree={tree}
              hiddenFacets={hiddenFacets}
              loading={showContentLoader}
              showFacetQuantity={showFacetQuantity}
            />
          )}
          <div className={styles.resultGallery}>
            {showContentLoader ? (
              <div className="w-100 flex justify-center">
                <div className="w3 ma0">
                  <Spinner />
                </div>
              </div>
            ) : (
              <div>
                {this.props.runtime.page === 'store.search#brand' && (
                  <ExtensionPoint
                    id="brand-content"
                    brandSlug={`${this.props.params.brand}`}
                    summary={summary}
                    mobileLayoutMode={mobileLayoutMode}
                  />
                )}
                {products.length > 0 ? (
                  <div>
                    {showCategoryPanel && (
                      <ExtensionPoint
                        id="category-panel"
                        tree={tree}
                        quantityOfItemsPerRow={quantityOfItemsPerRow}
                      />
                    )}
                    <ExtensionPoint
                      id="gallery"
                      products={products}
                      summary={summary}
                      className="bn"
                      mobileLayoutMode={mobileLayoutMode}
                    />
                  </div>
                ) : (
                  <div className={styles.gallery}>
                    <ExtensionPoint id="not-found" />
                  </div>
                )}
              </div>
            )}
            {children}
          </div>
          {mobile && (
            <div className={`${styles.border} bg-muted-5 h-50 self-center`} />
          )}
          <ExtensionPoint id="order-by" orderBy={orderBy} />
          {mobile && (
            <div className={`${styles.border2} bg-muted-5 h-50 self-center`} />
          )}
          {mobile && (
            <div
              className={`${styles.switch} flex justify-center items-center`}
            >
              <LayoutModeSwitcher
                activeMode={mobileLayoutMode}
                onChange={this.handleMobileLayoutChange}
              />
            </div>
          )}
        </div>
      </LoadingOverlay>
    )
  }
}

export default withRuntimeContext(SearchResult)

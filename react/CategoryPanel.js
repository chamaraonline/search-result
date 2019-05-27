import React, { Fragment } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Link } from 'vtex.render-runtime'
import { facetOptionShape } from './constants/propTypes'
import searchResult from './searchResult.css'
import CategoriesHighlights from 'vtex.store-components/CategoriesHighlights'
import { Query } from 'react-apollo'
import GET_FACET_IMAGES from './queries/facetImagesByFacetIds.graphql'
import { path } from 'ramda'

const renderCategoryShelf = (category, noOfChildren, quantityOfItemsPerRow) => {

  const categoriesHighlighted = category.children
    .slice(0, noOfChildren)
    .map(child => ({
      id: child.id,
      name: child.name,
      to: child.link,
    }))
  const headerClasses = classNames(
    searchResult.categoryPanelHeaderRow,
    'flex flex-row flex-wrap items-stretch pa3 bn mh4-ns'
  )
  const itemClasses = classNames(
    searchResult.categoryPanelItemRow,
    'flex flex-row flex-wrap items-stretch pa3 bn mh4-ns'
  )
  let i = 0
  let facetIds = []
  const items = {}
  for (i = 0; i < categoriesHighlighted.length; i++) {
    items[`item-${categoriesHighlighted[i].id}`] = categoriesHighlighted[i]
    facetIds.push(categoriesHighlighted[i].id)
  }

  const variables = {facetIds: facetIds.join(","), facetType:"category", page: 1, pageSize: facetIds.length + 1}

  return (
    <Fragment key={`parent-fragment-${category.id}`}>
      <h4 className={`t-heading-4 ${headerClasses}`}>
        <Link className="link c-muted-1" to={category.link}>{category.name}</Link>
      </h4>
      {facetIds.length !== 0 && (
        <Query
          query={GET_FACET_IMAGES}
          variables={variables}
        >
          {({ loading, error, data }) => {
            if (loading || error) return <div/>

            const categories = path(['facetImagesByFacetIds'], data)
            categories.forEach(category => {
              let key = `item-${category.facetId}`
              if(Object.keys(items).includes(key)){
                items[key] = { ...items[key], ...{ image: category.imageUrl} }
              }
            })

            return (
              <div className={itemClasses}>
                <CategoriesHighlights
                  categoriesHighlighted={items}
                  showCategoriesHighlighted
                  quantityOfItems={quantityOfItemsPerRow}
                />
              </div>
            )
          }}
        </Query>
      )}
      {category.children.map(child => {
        if (child.children && child.children.length > 0) {
          return renderCategoryShelf(child, noOfChildren, quantityOfItemsPerRow)
        }
      })}
    </Fragment>
  )
}

const CategoryPanel = ({ tree, noOfCategories, quantityOfItemsPerRow }) => {
  return (
    <div>
      {tree.map(category => {
        return renderCategoryShelf(
          category,
          noOfCategories,
          quantityOfItemsPerRow
        )
      })}
    </div>
  )
}

CategoryPanel.propTypes = {
  /** Category tree */
  tree: PropTypes.arrayOf(facetOptionShape),
  /** Number of category filters to be shown */
  noOfCategories: PropTypes.number,
  /** Number of categories per row */
  quantityOfItemsPerRow: PropTypes.number,
}

CategoryPanel.defaultProps = {
  tree: [],
  noOfCategories: 1000,
  quantityOfItemsPerRow: 6,
}

export default CategoryPanel

import React from 'react'
import { withResizeDetector } from 'react-resize-detector'
import { path } from 'ramda'
import classNames from 'classnames'
import { Query } from 'react-apollo'
import product from '../queries/product.gql'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Spinner } from 'vtex.styleguide'
import { LAYOUT_MODE } from './LayoutModeSwitcher'
import styles from '../searchResult.css'

const DEFAULT_WIDTH = 'auto'
const DEFAULT_HEIGHT = 'auto'
const MAX_WIDTH = 3000
const MAX_HEIGHT = 4000
/** Layout with two column */
const TWO_COLUMN_ITEMS = 2

const baseUrlRegex = new RegExp(/.+ids\/(\d+)/)

const httpRegex = new RegExp(/http:\/\//)

const findAvailableProduct = item =>
  item.sellers.find(
    ({ commertialOffer = {} }) => commertialOffer.AvailableQuantity > 0
  )

const toHttps = url => {
  return url.replace(httpRegex, 'https://')
}

const cleanImageUrl = imageUrl => {
  const result = baseUrlRegex.exec(imageUrl)
  if (result.length > 0) return result[0]
}

function replaceLegacyFileManagerUrl(imageUrl, width, height) {
  const legacyUrlPattern = '/arquivos/ids/'
  const isLegacyUrl = imageUrl.includes(legacyUrlPattern)
  if (!isLegacyUrl) return imageUrl
  return `${cleanImageUrl(imageUrl)}-${width}-${height}`
}

const changeImageUrlSize = (
  imageUrl,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT
) => {
  if (!imageUrl) return
  typeof width === 'number' && (width = Math.min(width, MAX_WIDTH))
  typeof height === 'number' && (height = Math.min(height, MAX_HEIGHT))

  const normalizedImageUrl = replaceLegacyFileManagerUrl(
    imageUrl,
    width,
    height
  )
  const queryStringSeparator = normalizedImageUrl.includes('?') ? '&' : '?'

  return `${normalizedImageUrl}${queryStringSeparator}width=${width}&height=${height}&aspect=true`
}

const normalizeProduct = product => {
  if (!product) return null
  const normalizedProduct = { ...product }
  const items = normalizedProduct.items || []
  const sku = items.find(findAvailableProduct) || items[0]
  if (sku) {
    const [seller = { commertialOffer: { Price: 0, ListPrice: 0 } }] =
      path(['sellers'], sku) || []
    const [referenceId = { Value: '' }] = path(['referenceId'], sku) || []
    const [image = { imageUrl: '' }] = path(['images'], sku) || []
    const resizedImage = changeImageUrlSize(toHttps(image.imageUrl), 500)
    const normalizedImage = { ...image, imageUrl: resizedImage }
    normalizedProduct.sku = {
      ...sku,
      seller,
      referenceId,
      image: normalizedImage,
    }
  }
  return normalizedProduct
}

const ProductShelfContent = ({
  productId,
  summary,
  mobileLayoutMode = LAYOUT_MODE[0].value,
  maxItemsPerRow = 5,
  minItemWidth = 240,
  width,
}) => {
  const runtime = useRuntime()

  const layoutMode = runtime.hints.mobile ? mobileLayoutMode : 'normal'

  const getItemsPerRow = () => {
    const maxItems = Math.floor(width / minItemWidth)
    return maxItemsPerRow <= maxItems ? maxItemsPerRow : maxItems
  }

  const itemsPerRow =
    layoutMode === 'small'
      ? TWO_COLUMN_ITEMS
      : getItemsPerRow() || maxItemsPerRow

  const style = {
    flexBasis: `${100 / itemsPerRow}%`,
    maxWidth: `${100 / itemsPerRow}%`,
  }

  return (
    <Query
      query={product}
      variables={{ identifier: { field: 'id', value: productId } }}
    >
      {({ data, loading, error }) => {
        if (loading) return <Spinner />
        if (error) return <p>ERROR</p>

        const product = normalizeProduct(data.product)
        return (
          <div
            key={productId}
            style={style}
            className={classNames(styles.galleryItem, 'pa4')}
          >
            <ExtensionPoint
              id="product-summary"
              {...summary}
              product={product}
              displayMode={layoutMode}
            />
          </div>
        )
      }}
    </Query>
  )
}

export default withResizeDetector(ProductShelfContent)

import React, { Component } from 'react'
import { compose, equals, find, head, prop, propEq } from 'ramda'
import { Query } from 'react-apollo'
import getBrandContent from './queries/getBrandContent.gql'
import getBrandList from './queries/getBrandList.gql'
import { Spinner, Tab, Tabs } from 'vtex.styleguide'
import ProductShelfContent from './components/ProductShelfContent'
import { VideoSlider } from 'vtex.video-slider'
import styles from './searchResult.css'

class BrandContent extends Component {
  constructor() {
    super()
    this.state = {
      currentTab: 1,
    }
    this.handleTabChange = this.handleTabChange.bind(this)
  }

  handleTabChange(tabIndex) {
    this.setState({
      currentTab: tabIndex,
    })
  }

  render() {
    const { brandSlug, summary, mobileLayoutMode } = this.props
    return (
      <Query query={getBrandList}>
        {({ data: { brands }, brandsLoading, brandListError }) => {
          if (brandsLoading || !brands) return <Spinner />
          if (brandListError) return <p>ERROR</p>

          const brand = find(
            compose(
              equals(brandSlug),
              prop('slug')
            ),
            brands
          )
          return (
            <Query
              query={getBrandContent}
              variables={{
                acronym: 'BrandContent',
                fields: ['brandId', 'description', 'newProducts', 'videos'],
                where: `(brandId=${brand.id})`,
                schema: 'brand-content-schema-v1',
              }}
            >
              {({ data, brandContentLoading, brandContentError }) => {
                if (brandContentLoading) return <Spinner />
                if (brandContentError || !data) return <p>ERROR</p>

                const fields = prop('fields', head(data.documents || {}))
                if (!fields) {
                  return <div />
                }

                const { value: description } = find(
                  propEq('key', 'description'),
                  fields
                )
                const { value: newProducts } = find(
                  propEq('key', 'newProducts'),
                  fields
                )
                const { value: videos } = find(propEq('key', 'videos'), fields)

                return (
                  <div
                    className={`${styles.brandGalleryContainer} bb b--muted-4`}
                  >
                    <Tabs>
                      <Tab
                        label="New Products"
                        active={this.state.currentTab === 1}
                        onClick={() => this.handleTabChange(1)}
                      >
                        <div
                          className={`${
                            styles.brandGalleryProductShelf
                          } flex flex-row flex-wrap items-stretch bn ph1 pl9-l na4`}
                        >
                          {newProducts &&
                            JSON.parse(newProducts).map(productItem => (
                              <ProductShelfContent
                                productId={productItem.productId}
                                key={`product-content-${productItem.productId}`}
                                summary={summary}
                                mobileLayoutMode={mobileLayoutMode}
                              />
                            ))}
                        </div>
                      </Tab>
                      <Tab
                        label="Videos"
                        active={this.state.currentTab === 2}
                        onClick={() => this.handleTabChange(2)}
                      >
                        <div className={styles.brandGalleryVideos}>
                          {videos && (
                            <VideoSlider
                              videos={JSON.parse(videos).map(video => ({
                                videoUrl: video.url,
                                videoTitle: video.title,
                              }))}
                            />
                          )}
                        </div>
                      </Tab>
                      <Tab
                        label="About"
                        active={this.state.currentTab === 3}
                        onClick={() => this.handleTabChange(3)}
                      >
                        <div
                          className={`${
                            styles.brandGalleryDescription
                          } w-100 mh9`}
                        >
                          {description && (
                            <p
                              className={
                                styles.brandGalleryDescriptionTextContent
                              }
                            >
                              {description}
                            </p>
                          )}
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}

export default BrandContent

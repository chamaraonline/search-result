import React, { Component } from 'react'
import { compose, equals, find, prop } from 'ramda'
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
                if (brandContentError) return <p>ERROR</p>

                const brandContent = {
                  id: '27c964bc-7639-11e9-828f-d599ef464471',
                  brandId: '2000000',
                  description: 'Test description',
                  newProducts: [
                    {
                      productId: '24',
                      description: 'Test product 24 description',
                    },
                    {
                      productId: '17',
                      description: 'Test product 17 description',
                    },
                  ],
                  videos: [
                    {
                      title: 'Video 1',
                      url:
                        'https://player.vimeo.com/video/142175573?title=0&byline=0&portrait=0',
                    },
                    {
                      title: 'Video 2',
                      url:
                        'https://player.vimeo.com/video/166034292?title=0&byline=0&portrait=0',
                    },
                  ],
                }
                return (
                  <div className={`${styles.brandGalleryContainer} bb b--muted-4`}>
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
                          {brandContent.newProducts &&
                            brandContent.newProducts.map(productItem => (
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
                          {brandContent.videos && (
                            <VideoSlider
                              videos={brandContent.videos.map(video => ({
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
                        <div className={`${styles.brandGalleryDescription} w-100 mh9`}>
                          {brandContent.description && (
                            <p className={styles.brandGalleryDescriptionTextContent}>{brandContent.description}</p>
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

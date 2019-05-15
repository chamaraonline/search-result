import React, { Component } from 'react'
import { compose, equals, find, prop } from 'ramda'
import { Query } from 'react-apollo'
import getBrandContent from './queries/getBrandContent.gql'
import getBrandList from './queries/getBrandList.gql'
import { Spinner, Tab, Tabs } from 'vtex.styleguide'
import ProductShelfContent from './components/ProductShelfContent'
import { VideoSlider } from 'vtex.video-slider'

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
    const { brandSlug, summary } = this.props
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
                  <div>
                    <Tabs>
                      <Tab
                        label="New Products"
                        active={this.state.currentTab === 1}
                        onClick={() => this.handleTabChange(1)}
                      >
                        <div>
                          {brandContent.newProducts &&
                            brandContent.newProducts.map(productItem => (
                              <ProductShelfContent
                                productId={productItem.productId}
                                key={`product-content-${productItem.productId}`}
                                summary={summary}
                              />
                            ))}
                        </div>
                      </Tab>
                      <Tab
                        label="Videos"
                        active={this.state.currentTab === 2}
                        onClick={() => this.handleTabChange(2)}
                      >
                        <div>
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
                        {brandContent.description && (
                          <p>{brandContent.description}</p>
                        )}
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

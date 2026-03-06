import { Composition, registerRoot } from 'remotion'

// Image templates
import { OgImage, ogImageSchema } from './image/OgImage'
import { SocialPost, socialPostSchema } from './image/SocialPost'
import { Quote, quoteImageSchema } from './image/Quote'
import { Thumbnail, thumbnailSchema } from './image/Thumbnail'
import { Infographic, infographicSchema } from './image/Infographic'

// Carousel templates
import { CardNews, cardNewsSchema } from './carousel/CardNews'
import { StepByStep, stepByStepSchema } from './carousel/StepByStep'
import { BeforeAfter, beforeAfterSchema } from './carousel/BeforeAfter'
import { ListCarousel, listCarouselSchema } from './carousel/ListCarousel'
import { QuoteCarousel, quoteCarouselSchema } from './carousel/QuoteCarousel'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* === Image === */}
      <Composition
        id="OgImage"
        component={OgImage}
        durationInFrames={1}
        fps={1}
        width={1200}
        height={630}
        schema={ogImageSchema}
      />
      <Composition
        id="SocialPost"
        component={SocialPost}
        durationInFrames={1}
        fps={1}
        width={1080}
        height={1080}
        schema={socialPostSchema}
      />
      <Composition
        id="Quote"
        component={Quote}
        durationInFrames={1}
        fps={1}
        width={1080}
        height={1080}
        schema={quoteImageSchema}
      />
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={1}
        width={1280}
        height={720}
        schema={thumbnailSchema}
      />
      <Composition
        id="Infographic"
        component={Infographic}
        durationInFrames={1}
        fps={1}
        width={1080}
        height={1920}
        schema={infographicSchema}
      />

      {/* === Carousel (각 슬라이드를 개별 프레임으로) === */}
      <Composition
        id="CardNews"
        component={CardNews}
        durationInFrames={10}
        fps={1}
        width={1080}
        height={1350}
        schema={cardNewsSchema}
      />
      <Composition
        id="StepByStep"
        component={StepByStep}
        durationInFrames={10}
        fps={1}
        width={1080}
        height={1350}
        schema={stepByStepSchema}
      />
      <Composition
        id="BeforeAfter"
        component={BeforeAfter}
        durationInFrames={10}
        fps={1}
        width={1080}
        height={1350}
        schema={beforeAfterSchema}
      />
      <Composition
        id="ListCarousel"
        component={ListCarousel}
        durationInFrames={10}
        fps={1}
        width={1080}
        height={1350}
        schema={listCarouselSchema}
      />
      <Composition
        id="QuoteCarousel"
        component={QuoteCarousel}
        durationInFrames={10}
        fps={1}
        width={1080}
        height={1350}
        schema={quoteCarouselSchema}
      />
    </>
  )
}

registerRoot(RemotionRoot)

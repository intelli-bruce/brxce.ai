import { Composition, Still, registerRoot } from 'remotion'

// Video compositions
import { VSReel, vsReelSchema, defaultVSReelProps, calculateVSReelDuration } from './video/VSReel'
import { ShortFormVideo, shortFormVideoSchema, defaultShortFormVideoProps, calculateShortFormDuration } from './video/ShortFormVideo'
import { TextOverVideo, textOverVideoSchema, defaultTextOverVideoProps, calculateTextOverVideoDuration } from './video/TextOverVideo'
import { NewsBreaking, newsBreakingSchema } from './video/NewsBreaking'
import { Demo60s, demo60sSchema } from './video/Demo60s'
import { DayInTheLife, dayInTheLifeSchema, defaultProps as defaultDayInTheLifeProps, calculateDuration as calculateDayInTheLifeDuration } from './video/DayInTheLife'

// Carousel compositions
import { CardNews, cardNewsSchema } from './carousel/CardNews'
import { StepByStep, stepByStepSchema } from './carousel/StepByStep'
import { BeforeAfter, beforeAfterSchema } from './carousel/BeforeAfter'
import { ListCarousel, listCarouselSchema } from './carousel/ListCarousel'
import { QuoteCarousel, quoteCarouselSchema } from './carousel/QuoteCarousel'

// Image compositions (rendered as Still)
import { OgImage, ogImageSchema } from './image/OgImage'
import { SocialPost, socialPostSchema } from './image/SocialPost'
import { Infographic, infographicSchema } from './image/Infographic'
import { Quote, quoteImageSchema } from './image/Quote'
import { Thumbnail, thumbnailSchema } from './image/Thumbnail'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ====== VIDEO ====== */}
      <Composition
        id="VSReel"
        component={VSReel}
        schema={vsReelSchema}
        defaultProps={defaultVSReelProps}
        durationInFrames={calculateVSReelDuration(defaultVSReelProps)}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: calculateVSReelDuration(props),
        })}
      />
      <Composition
        id="ShortFormVideo"
        component={ShortFormVideo}
        schema={shortFormVideoSchema}
        defaultProps={defaultShortFormVideoProps}
        durationInFrames={calculateShortFormDuration(defaultShortFormVideoProps)}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: calculateShortFormDuration(props),
        })}
      />
      <Composition
        id="TextOverVideo"
        component={TextOverVideo}
        schema={textOverVideoSchema}
        defaultProps={defaultTextOverVideoProps}
        durationInFrames={calculateTextOverVideoDuration(defaultTextOverVideoProps)}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: calculateTextOverVideoDuration(props),
        })}
      />
      <Composition
        id="NewsBreaking"
        component={NewsBreaking}
        schema={newsBreakingSchema}
        defaultProps={{
          headline: 'Breaking News',
          points: [],
          alertDuration: 120,
          headlineDuration: 180,
          pointsDuration: 300,
          opinionDuration: 180,
          headlineFontSize: 56,
          pointsFontSize: 40,
          alertColor: '#FF3B30',
          accentColor: '#FFD700',
        }}
        durationInFrames={780}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames:
            props.alertDuration +
            props.headlineDuration +
            (props.points.length > 0 ? props.pointsDuration : 0) +
            (props.opinion ? props.opinionDuration : 0),
        })}
      />
      <Composition
        id="Demo60s"
        component={Demo60s}
        schema={demo60sSchema}
        defaultProps={{
          hookText: '60초 만에 만든다',
          resultText: '',
          demoVideo: '',
          demoStartFrom: 0,
          ctaText: "'템플릿' 댓글 달면 공유해드림",
          ctaKeyword: '템플릿',
          hookDuration: 180,
          demoDuration: 3000,
          ctaDuration: 420,
          hookFontSize: 72,
          ctaFontSize: 48,
          accentColor: '#FFD700',
          showLogo: true,
          logoEmoji: '🦞',
        }}
        durationInFrames={3600}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.hookDuration + props.demoDuration + props.ctaDuration,
        })}
      />
      <Composition
        id="DayInTheLife"
        component={DayInTheLife}
        schema={dayInTheLifeSchema}
        defaultProps={defaultDayInTheLifeProps}
        durationInFrames={calculateDayInTheLifeDuration(defaultDayInTheLifeProps)}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: calculateDayInTheLifeDuration(props),
        })}
      />

      {/* ====== CAROUSEL (Still, slideIndex via props) ====== */}
      <Still id="CardNews" component={CardNews} schema={cardNewsSchema}
        defaultProps={{ slides: [{ title: 'Title', body: 'Body' }], slideIndex: 0, accentColor: '#FF6B35' }}
        width={1080} height={1440} />
      <Still id="StepByStep" component={StepByStep} schema={stepByStepSchema}
        defaultProps={{ title: 'Guide', steps: [{ number: 1, heading: 'Step', body: 'Detail' }], slideIndex: 0, accentColor: '#FF6B35' }}
        width={1080} height={1440} />
      <Still id="BeforeAfter" component={BeforeAfter} schema={beforeAfterSchema}
        defaultProps={{ items: [{ before: 'Before', after: 'After' }], slideIndex: 0, accentColor: '#FF6B35' }}
        width={1080} height={1440} />
      <Still id="ListCarousel" component={ListCarousel} schema={listCarouselSchema}
        defaultProps={{ slides: [{ heading: 'List', items: [{ text: 'Item' }] }], slideIndex: 0, accentColor: '#FF6B35' }}
        width={1080} height={1440} />
      <Still id="QuoteCarousel" component={QuoteCarousel} schema={quoteCarouselSchema}
        defaultProps={{ quotes: [{ text: 'Quote', author: 'Author' }], slideIndex: 0, accentColor: '#4ECDC4' }}
        width={1080} height={1440} />

      {/* ====== IMAGE (Still) ====== */}
      <Still id="OgImage" component={OgImage} schema={ogImageSchema}
        defaultProps={{ title: 'Title', accentColor: '#FF6B35', theme: 'dark' as const }}
        width={1200} height={630} />
      <Still id="SocialPost" component={SocialPost} schema={socialPostSchema}
        defaultProps={{ title: 'Title', message: 'Message', accentColor: '#FF6B35', layout: 'centered' as const }}
        width={1080} height={1080} />
      <Still id="Infographic" component={Infographic} schema={infographicSchema}
        defaultProps={{ title: 'Title', sections: [{ icon: '📊', heading: 'Section', body: 'Detail' }], accentColor: '#FF6B35' }}
        width={1080} height={1920} />
      <Still id="Quote" component={Quote} schema={quoteImageSchema}
        defaultProps={{ text: 'Quote text', author: 'Author', accentColor: '#4ECDC4' }}
        width={1080} height={1080} />
      <Still id="Thumbnail" component={Thumbnail} schema={thumbnailSchema}
        defaultProps={{ title: 'Title', accentColor: '#FF6B35', theme: 'dark' as const }}
        width={1280} height={720} />
    </>
  )
}

registerRoot(RemotionRoot)

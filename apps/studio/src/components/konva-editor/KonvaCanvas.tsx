'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Stage, Layer, Rect, Text, Circle, Transformer, Group } from 'react-konva'
import type Konva from 'konva'
import type { CanvasElement, TextElement, RectElement, CircleElement } from './types'

interface KonvaCanvasProps {
  width: number
  height: number
  backgroundColor: string
  elements: CanvasElement[]
  selectedElementId: string | null
  zoom: number
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void
}

function RenderText({ el }: { el: TextElement }) {
  return (
    <Text
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      text={el.text}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle={el.fontWeight >= 700 ? 'bold' : 'normal'}
      fill={el.fill}
      lineHeight={el.lineHeight}
      letterSpacing={el.letterSpacing}
      align={el.align}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
    />
  )
}

function RenderRect({ el }: { el: RectElement }) {
  return (
    <Rect
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      cornerRadius={el.cornerRadius}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
    />
  )
}

function RenderCircle({ el }: { el: CircleElement }) {
  return (
    <Circle
      id={el.id}
      x={el.x + el.width / 2}
      y={el.y + el.height / 2}
      radiusX={el.width / 2}
      radiusY={el.height / 2}
      fill={el.fill}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
    />
  )
}

function RenderElement({ el }: { el: CanvasElement }) {
  switch (el.type) {
    case 'text':
      return <RenderText el={el} />
    case 'rect':
      return <RenderRect el={el} />
    case 'circle':
      return <RenderCircle el={el} />
    default:
      return null
  }
}

export function KonvaCanvas({
  width,
  height,
  backgroundColor,
  elements,
  selectedElementId,
  zoom,
  onSelect,
  onUpdate,
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage) return

    if (selectedElementId) {
      const node = stage.findOne(`#${selectedElementId}`)
      if (node) {
        transformer.nodes([node])
        transformer.getLayer()?.batchDraw()
        return
      }
    }
    transformer.nodes([])
    transformer.getLayer()?.batchDraw()
  }, [selectedElementId, elements])

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Click on empty area = deselect
      if (e.target === e.target.getStage() || e.target.attrs?.id === 'bg') {
        onSelect(null)
        return
      }
      const id = e.target.id()
      if (id) onSelect(id)
    },
    [onSelect],
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const id = e.target.id()
      if (!id) return
      onUpdate(id, {
        x: Math.round(e.target.x()),
        y: Math.round(e.target.y()),
      })
    },
    [onUpdate],
  )

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const id = node.id()
      if (!id) return

      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      // Reset scale and apply to width/height
      node.scaleX(1)
      node.scaleY(1)

      onUpdate(id, {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.round(Math.max(20, node.width() * scaleX)),
        height: Math.round(Math.max(20, node.height() * scaleY)),
        rotation: Math.round(node.rotation()),
      })
    },
    [onUpdate],
  )

  const stageWidth = width * zoom
  const stageHeight = height * zoom

  return (
    <div
      className="flex items-center justify-center overflow-auto"
      style={{ width: '100%', height: '100%' }}
    >
      <div
        style={{
          boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={zoom}
          scaleY={zoom}
          onClick={handleStageClick}
          onTap={handleStageClick as any}
        >
          <Layer>
            {/* Background */}
            <Rect
              id="bg"
              x={0}
              y={0}
              width={width}
              height={height}
              fill={backgroundColor}
            />

            {/* Elements */}
            {elements.map((el) => (
              <RenderElement key={el.id} el={el} />
            ))}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 10 || newBox.height < 10) return oldBox
                return newBox
              }}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              anchorCornerRadius={3}
              anchorStroke="#ff6b35"
              anchorFill="#fff"
              borderStroke="#ff6b35"
              borderStrokeWidth={1.5}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  )
}

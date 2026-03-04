'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

// Instagram carousel preset
const CANVAS_PRESETS = {
  instagram: { width: 1080, height: 1350, label: '인스타 캐러셀 (1080×1350)' },
  instagramSquare: { width: 1080, height: 1080, label: '인스타 정사각형 (1080×1080)' },
  instagramStory: { width: 1080, height: 1920, label: '인스타 스토리 (1080×1920)' },
  threads: { width: 1080, height: 1080, label: 'Threads (1080×1080)' },
};

type PresetKey = keyof typeof CANVAS_PRESETS;

// Brand colors
const BRAND = {
  accent: '#ff6b35',
  dark: '#1a1a2e',
  darkAlt: '#16213e',
  white: '#ffffff',
};

export default function DesignEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [preset, setPreset] = useState<PresetKey>('instagram');
  const [zoom, setZoom] = useState(50);
  const [selectedObj, setSelectedObj] = useState<fabric.FabricObject | null>(null);
  const [objProps, setObjProps] = useState<Record<string, any>>({});

  const currentPreset = CANVAS_PRESETS[preset];

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: currentPreset.width,
      height: currentPreset.height,
      backgroundColor: BRAND.dark,
      selection: true,
    });

    fabricRef.current = canvas;

    // Selection events
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObj(obj);
        updateObjProps(obj);
      }
    });
    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        setSelectedObj(obj);
        updateObjProps(obj);
      }
    });
    canvas.on('selection:cleared', () => {
      setSelectedObj(null);
      setObjProps({});
    });
    canvas.on('object:modified', () => {
      const active = canvas.getActiveObject();
      if (active) updateObjProps(active);
    });

    // Zoom with scroll
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let z = canvas.getZoom();
      z *= 0.999 ** delta;
      z = Math.min(Math.max(z, 0.1), 5);
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), z);
      setZoom(Math.round(z * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Apply initial zoom to fit container
    requestAnimationFrame(() => {
      if (containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        const scaleX = (containerW - 80) / currentPreset.width;
        const scaleY = (containerH - 80) / currentPreset.height;
        const fitZoom = Math.min(scaleX, scaleY, 1);
        canvas.setZoom(fitZoom);
        canvas.setDimensions({
          width: currentPreset.width * fitZoom,
          height: currentPreset.height * fitZoom,
        });
        setZoom(Math.round(fitZoom * 100));
      }
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [preset]); // Re-init when preset changes

  const updateObjProps = (obj: fabric.FabricObject) => {
    const props: Record<string, any> = {
      type: obj.type,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      fill: obj.fill as string,
      opacity: obj.opacity ?? 1,
      angle: obj.angle || 0,
    };
    if (obj.type === 'textbox' || obj.type === 'i-text') {
      const textObj = obj as fabric.Textbox;
      props.text = textObj.text;
      props.fontSize = textObj.fontSize;
      props.fontWeight = textObj.fontWeight;
      props.fontFamily = textObj.fontFamily;
      props.textAlign = textObj.textAlign;
    }
    setObjProps(props);
  };

  const setProp = useCallback((key: string, value: any) => {
    if (!selectedObj || !fabricRef.current) return;
    (selectedObj as any).set(key, value);
    fabricRef.current.renderAll();
    updateObjProps(selectedObj);
  }, [selectedObj]);

  // Add objects
  const addText = useCallback(() => {
    if (!fabricRef.current) return;
    const text = new fabric.Textbox('텍스트를 입력하세요', {
      left: 100,
      top: 100,
      width: 600,
      fontSize: 64,
      fontWeight: 'bold',
      fontFamily: 'Pretendard, sans-serif',
      fill: BRAND.white,
      textAlign: 'center',
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  }, []);

  const addRect = useCallback(() => {
    if (!fabricRef.current) return;
    const rect = new fabric.Rect({
      left: 200,
      top: 200,
      width: 300,
      height: 300,
      fill: BRAND.accent,
      rx: 16,
      ry: 16,
    });
    fabricRef.current.add(rect);
    fabricRef.current.setActiveObject(rect);
    fabricRef.current.renderAll();
  }, []);

  const addCircle = useCallback(() => {
    if (!fabricRef.current) return;
    const circle = new fabric.Circle({
      left: 300,
      top: 300,
      radius: 120,
      fill: BRAND.accent,
    });
    fabricRef.current.add(circle);
    fabricRef.current.setActiveObject(circle);
    fabricRef.current.renderAll();
  }, []);

  const addLine = useCallback(() => {
    if (!fabricRef.current) return;
    const line = new fabric.Line([100, 200, 500, 200], {
      stroke: BRAND.accent,
      strokeWidth: 4,
    });
    fabricRef.current.add(line);
    fabricRef.current.setActiveObject(line);
    fabricRef.current.renderAll();
  }, []);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricRef.current) return;
      const url = URL.createObjectURL(file);
      const img = await fabric.FabricImage.fromURL(url);
      // Scale to fit canvas
      const maxW = currentPreset.width * 0.8;
      const maxH = currentPreset.height * 0.8;
      const scale = Math.min(maxW / img.width!, maxH / img.height!, 1);
      img.set({ scaleX: scale, scaleY: scale, left: 50, top: 50 });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.renderAll();
    };
    input.click();
  }, [currentPreset]);

  // Delete selected
  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.remove(active);
      fabricRef.current.renderAll();
    }
  }, []);

  // Export
  const exportJSON = useCallback(() => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-${preset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [preset]);

  const exportPNG = useCallback(() => {
    if (!fabricRef.current) return;
    // Export at full resolution
    const currentZoom = fabricRef.current.getZoom();
    fabricRef.current.setZoom(1);
    fabricRef.current.setDimensions({
      width: currentPreset.width,
      height: currentPreset.height,
    });

    const dataUrl = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    // Restore zoom
    fabricRef.current.setZoom(currentZoom);
    fabricRef.current.setDimensions({
      width: currentPreset.width * currentZoom,
      height: currentPreset.height * currentZoom,
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `design-${preset}.png`;
    a.click();
  }, [preset, currentPreset]);

  const importJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        await fabricRef.current!.loadFromJSON(json);
        fabricRef.current!.renderAll();
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/carousel" className="text-gray-400 hover:text-white text-sm">
            ← 캐러셀
          </a>
          <h1 className="text-white font-bold text-lg">🎨 디자인 에디터</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetKey)}
            className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600"
          >
            {Object.entries(CANVAS_PRESETS).map(([key, v]) => (
              <option key={key} value={key}>{v.label}</option>
            ))}
          </select>
          <span className="text-gray-400 text-sm ml-2">{zoom}%</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm rounded px-3 py-1.5 transition">
            📂 불러오기
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
          <button onClick={exportJSON} className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded px-3 py-1.5 transition">
            💾 JSON
          </button>
          <button onClick={exportPNG} className="bg-orange-600 hover:bg-orange-500 text-white text-sm rounded px-3 py-1.5 font-medium transition">
            📸 PNG 내보내기
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-3 shrink-0">
          <ToolBtn onClick={addText} title="텍스트">T</ToolBtn>
          <ToolBtn onClick={addRect} title="사각형">
            <div className="w-5 h-5 bg-orange-500 rounded-sm" />
          </ToolBtn>
          <ToolBtn onClick={addCircle} title="원">
            <div className="w-5 h-5 bg-orange-500 rounded-full" />
          </ToolBtn>
          <ToolBtn onClick={addLine} title="라인">
            <div className="w-6 h-0.5 bg-orange-500" />
          </ToolBtn>
          <ToolBtn onClick={addImage} title="이미지">🖼️</ToolBtn>
          <div className="flex-1" />
          <ToolBtn onClick={deleteSelected} title="삭제">🗑️</ToolBtn>
        </aside>

        {/* Canvas Area */}
        <main
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center bg-[#2d2d3d]"
        >
          <div className="shadow-2xl">
            <canvas ref={canvasRef} />
          </div>
        </main>

        {/* Right Panel — Properties */}
        <aside className="w-72 bg-gray-800 border-l border-gray-700 p-4 shrink-0 overflow-y-auto">
          {selectedObj ? (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-sm border-b border-gray-700 pb-2">
                속성 — {objProps.type}
              </h3>

              {/* Position */}
              <PropSection label="위치">
                <div className="grid grid-cols-2 gap-2">
                  <PropInput label="X" value={objProps.left} onChange={(v) => setProp('left', v)} type="number" />
                  <PropInput label="Y" value={objProps.top} onChange={(v) => setProp('top', v)} type="number" />
                </div>
              </PropSection>

              {/* Size */}
              <PropSection label="크기">
                <div className="grid grid-cols-2 gap-2">
                  <PropInput label="W" value={objProps.width} onChange={(v) => {
                    if (selectedObj) {
                      const scale = v / (selectedObj.width || 1);
                      setProp('scaleX', scale);
                    }
                  }} type="number" />
                  <PropInput label="H" value={objProps.height} onChange={(v) => {
                    if (selectedObj) {
                      const scale = v / (selectedObj.height || 1);
                      setProp('scaleY', scale);
                    }
                  }} type="number" />
                </div>
              </PropSection>

              {/* Rotation */}
              <PropSection label="회전">
                <PropInput label="°" value={objProps.angle} onChange={(v) => setProp('angle', v)} type="number" />
              </PropSection>

              {/* Text properties */}
              {(objProps.type === 'textbox' || objProps.type === 'i-text') && (
                <PropSection label="텍스트">
                  <textarea
                    value={objProps.text || ''}
                    onChange={(e) => setProp('text', e.target.value)}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 border border-gray-600 resize-none"
                    rows={3}
                  />
                  <PropInput label="크기" value={objProps.fontSize} onChange={(v) => setProp('fontSize', v)} type="number" />
                  <select
                    value={objProps.textAlign || 'left'}
                    onChange={(e) => setProp('textAlign', e.target.value)}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 mt-1"
                  >
                    <option value="left">왼쪽</option>
                    <option value="center">가운데</option>
                    <option value="right">오른쪽</option>
                  </select>
                </PropSection>
              )}

              {/* Fill */}
              <PropSection label="채우기">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={typeof objProps.fill === 'string' ? objProps.fill : '#ffffff'}
                    onChange={(e) => setProp('fill', e.target.value)}
                    className="w-8 h-8 rounded border border-gray-600 cursor-pointer bg-transparent"
                  />
                  <span className="text-gray-300 text-xs font-mono">{objProps.fill}</span>
                </div>
              </PropSection>

              {/* Opacity */}
              <PropSection label="투명도">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={objProps.opacity ?? 1}
                  onChange={(e) => setProp('opacity', Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <span className="text-gray-400 text-xs">{Math.round((objProps.opacity ?? 1) * 100)}%</span>
              </PropSection>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-4xl mb-3">🎨</p>
              <p className="text-sm leading-relaxed">
                오브젝트를 선택하면<br />속성이 표시됩니다
              </p>
              <div className="mt-8 text-left space-y-2">
                <p className="text-xs text-gray-600 font-medium">단축키</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>⌘C / ⌘V — 복사 / 붙여넣기</p>
                  <p>Delete — 삭제</p>
                  <p>스크롤 — 줌</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- Sub-components ---

function ToolBtn({ onClick, title, children }: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-lg transition"
    >
      {children}
    </button>
  );
}

function PropSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-gray-400 text-xs font-medium block">{label}</label>
      {children}
    </div>
  );
}

function PropInput({ label, value, onChange, type = 'text' }: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500 text-xs w-4">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 w-full"
      />
    </div>
  );
}

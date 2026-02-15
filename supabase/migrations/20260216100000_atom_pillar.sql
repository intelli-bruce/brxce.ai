-- Campaign Atoms: Pillar → Derivatives 구조 추가
-- 2026-02-16

-- 1. Pillar 관련 컬럼 추가
ALTER TABLE campaign_atoms
  ADD COLUMN pillar_atom_id UUID REFERENCES campaign_atoms(id) ON DELETE SET NULL,
  ADD COLUMN is_pillar BOOLEAN DEFAULT FALSE;

CREATE INDEX campaign_atoms_pillar ON campaign_atoms (pillar_atom_id);

-- 2. 기존 brxce_guide/long_text atom을 Pillar로 마킹
UPDATE campaign_atoms
SET is_pillar = true
WHERE format = 'long_text' AND channel = 'brxce_guide';

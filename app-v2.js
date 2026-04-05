/* ═══════════════════════════════════════════════════════════
   DM FORGE  –  app.js
   Pure JavaScript – no backend, no dependencies
   All data lives in localStorage
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
const S = {
  user:         null,   // { username, passwordHash }
  sessions:     [],
  campaigns:    [],
  factions:     [],
  activeSession:null,
  theme:        'dark',
  rollHistory:  [],
  advantage:    'normal',
  // combat
  initiative:   [],
  currentTurn:  0,
  round:        1,
  hpEntries:    [],
  // prep form
  prep: { pcs:[], npcs:[], locations:[], encounters:[], loot:[], plot:[], notes:[] },
  prepCarrySource: null,
  // monsters sort
  monsterSort:  { key:'cr', dir:1 },
};

// ─────────────────────────────────────────────────────────────
//  MONSTERS DATA  (SRD-based, simplified for quick reference)
// ─────────────────────────────────────────────────────────────
const MONSTERS = [
  // Beasts
  { name:'Rat',            cr:'0',   type:'Beast',       size:'Tiny',   hp:1,   ac:10, speed:'20 ft',  str:2,dex:11,con:9,  int:2,wis:10,cha:4,  attacks:'Bite +0, 1 piercing',                     traits:'—' },
  { name:'Giant Rat',      cr:'1/8', type:'Beast',       size:'Small',  hp:7,   ac:12, speed:'30 ft',  str:7,dex:15,con:11, int:2,wis:10,cha:4,  attacks:'Bite +4, 1d4+2 piercing',                 traits:'Pack Tactics' },
  { name:'Wolf',           cr:'1/4', type:'Beast',       size:'Medium', hp:11,  ac:13, speed:'40 ft',  str:12,dex:15,con:12,int:3,wis:12,cha:6,  attacks:'Bite +4, 2d4+2 piercing, knocked prone',  traits:'Pack Tactics, Keen Senses' },
  { name:'Brown Bear',     cr:'1',   type:'Beast',       size:'Large',  hp:34,  ac:11, speed:'40 ft',  str:19,dex:10,con:16,int:2,wis:13,cha:7,  attacks:'Claws +5, 2d6+4 / Bite +5, 1d8+4',       traits:'Keen Smell' },
  { name:'Giant Spider',   cr:'1',   type:'Beast',       size:'Large',  hp:26,  ac:14, speed:'30 ft',  str:14,dex:16,con:12,int:2,wis:11,cha:4,  attacks:'Bite +5, 1d8+3 + 2d8 poison DC11',       traits:'Web (DC11 restrained), Spider Climb' },
  { name:'Dire Wolf',      cr:'1',   type:'Beast',       size:'Large',  hp:37,  ac:14, speed:'50 ft',  str:17,dex:15,con:15,int:3,wis:12,cha:7,  attacks:'Bite +5, 2d6+3 + knocked prone',          traits:'Pack Tactics, Keen Senses' },
  { name:'Giant Eagle',    cr:'1',   type:'Beast',       size:'Large',  hp:26,  ac:13, speed:'10/80 ft',str:16,dex:17,con:13,int:8,wis:14,cha:10, attacks:'Talons +5, 2d6+3',                       traits:'Keen Sight' },
  { name:'Owlbear',        cr:'3',   type:'Monstrosity', size:'Large',  hp:59,  ac:13, speed:'40 ft',  str:20,dex:12,con:17,int:3,wis:12,cha:7,  attacks:'Beak +7, 1d10+5 / Claws +7, 2d8+5',      traits:'Keen Sight & Smell' },
  { name:'Basilisk',       cr:'3',   type:'Monstrosity', size:'Medium', hp:52,  ac:15, speed:'20 ft',  str:16,dex:8,con:15, int:2,wis:8,cha:7,  attacks:'Bite +5, 2d6+3 + Petrifying Gaze',        traits:'Petrifying Gaze DC12 CON' },
  { name:'Cockatrice',     cr:'1/2', type:'Monstrosity', size:'Small',  hp:27,  ac:11, speed:'20/40 ft',str:6,dex:12,con:12,int:2,wis:13,cha:5,  attacks:'Beak +3, 1d4+1 + DC11 CON petrify',      traits:'Petrification in 3 rounds' },
  { name:'Griffon',        cr:'2',   type:'Monstrosity', size:'Large',  hp:59,  ac:12, speed:'30/80 ft',str:18,dex:15,con:16,int:2,wis:13,cha:8, attacks:'Beak +6, 1d8+4 / Claws +6, 2d6+4',       traits:'Keen Sight' },
  { name:'Manticore',      cr:'3',   type:'Monstrosity', size:'Large',  hp:68,  ac:14, speed:'30/50 ft',str:17,dex:16,con:17,int:7,wis:12,cha:8, attacks:'Claws +5, 2d6+3 / Tail Spikes ×3, 2d6+3',traits:'Tail Spike Volley' },
  // Humanoids
  { name:'Bandit',         cr:'1/8', type:'Humanoid',    size:'Medium', hp:11,  ac:12, speed:'30 ft',  str:11,dex:12,con:12,int:10,wis:10,cha:10, attacks:'Scimitar +3, 1d6+1 / Crossbow +3, 1d8+1', traits:'—' },
  { name:'Bandit Captain', cr:'2',   type:'Humanoid',    size:'Medium', hp:65,  ac:15, speed:'30 ft',  str:15,dex:16,con:14,int:14,wis:11,cha:14, attacks:'Scimitar ×2 +5, 1d6+3 / Dagger +5, 1d4+3',traits:'Multiattack (3 attacks)' },
  { name:'Guard',          cr:'1/8', type:'Humanoid',    size:'Medium', hp:11,  ac:16, speed:'30 ft',  str:13,dex:12,con:12,int:10,wis:11,cha:10, attacks:'Spear +3, 1d6+1',                         traits:'—' },
  { name:'Knight',         cr:'3',   type:'Humanoid',    size:'Medium', hp:52,  ac:18, speed:'30 ft',  str:16,dex:11,con:14,int:11,wis:11,cha:15, attacks:'Greatsword ×2 +5, 2d6+3 / Crossbow +2, 1d8',traits:'Multiattack, Leadership (recharge 5–6)' },
  { name:'Mage',           cr:'6',   type:'Humanoid',    size:'Medium', hp:40,  ac:12, speed:'30 ft',  str:9,dex:14,con:11,int:17,wis:12,cha:11, attacks:'Dagger +5, 1d4+2 / Spells (Fireball DC14)',traits:'Spellcasting INT, Cantrips: Fire Bolt, Light' },
  { name:'Spy',            cr:'1',   type:'Humanoid',    size:'Medium', hp:27,  ac:12, speed:'30 ft',  str:10,dex:15,con:10,int:12,wis:14,cha:16, attacks:'Shortsword ×2 +4, 1d6+2',                 traits:'Multiattack, Cunning Action, Sneak Attack 2d6' },
  { name:'Goblin',         cr:'1/4', type:'Humanoid',    size:'Small',  hp:7,   ac:15, speed:'30 ft',  str:8,dex:14,con:10,int:10,wis:8,cha:8,  attacks:'Scimitar +4, 1d6+2 / Shortbow +4, 1d6+2',  traits:'Nimble Escape (Disengage/Hide bonus action)' },
  { name:'Hobgoblin',      cr:'1/2', type:'Humanoid',    size:'Medium', hp:11,  ac:18, speed:'30 ft',  str:13,dex:12,con:12,int:10,wis:10,cha:9,  attacks:'Longsword +3, 1d8+1 / Longbow +3, 1d8+1', traits:'Martial Advantage +2d6 if ally adjacent' },
  { name:'Bugbear',        cr:'1',   type:'Humanoid',    size:'Medium', hp:27,  ac:16, speed:'30 ft',  str:15,dex:14,con:13,int:8,wis:11,cha:9,  attacks:'Morningstar +4, 2d8+2',                    traits:'Surprise Attack +2d6, Brute (extra damage die)' },
  { name:'Kobold',         cr:'1/8', type:'Humanoid',    size:'Small',  hp:5,   ac:12, speed:'30 ft',  str:7,dex:15,con:9,  int:8,wis:7,cha:8,  attacks:'Dagger +4, 1d4+2 / Sling +4, 1d4+2',       traits:'Pack Tactics, Sunlight Sensitivity' },
  { name:'Orc',            cr:'1/2', type:'Humanoid',    size:'Medium', hp:15,  ac:13, speed:'30 ft',  str:16,dex:12,con:16,int:7,wis:11,cha:10, attacks:'Greataxe +5, 1d12+3 / Javelin +5, 1d6+3',  traits:'Aggressive (move to enemy as bonus action)' },
  { name:'Gnoll',          cr:'1/2', type:'Humanoid',    size:'Medium', hp:22,  ac:15, speed:'30 ft',  str:14,dex:12,con:11,int:6,wis:10,cha:7,  attacks:'Bite +4, 1d4+2 / Spear +4, 1d6+2',         traits:'Rampage (bonus action bite on kill)' },
  { name:'Lizardfolk',     cr:'1/2', type:'Humanoid',    size:'Medium', hp:22,  ac:15, speed:'30 ft',  str:15,dex:10,con:13,int:7,wis:12,cha:7,  attacks:'Bite +4, 1d6+2 / Heavy Club +4, 1d6+2',    traits:'Hold Breath 15 min, Multiattack (2 attacks)' },
  // Undead
  { name:'Skeleton',       cr:'1/4', type:'Undead',      size:'Medium', hp:13,  ac:13, speed:'30 ft',  str:10,dex:14,con:15,int:6,wis:8,cha:5,  attacks:'Shortsword +4, 1d6+2 / Shortbow +4, 1d6+2', traits:'Immune: poison, exhaustion; Resist: piercing/slashing' },
  { name:'Zombie',         cr:'1/4', type:'Undead',      size:'Medium', hp:22,  ac:8,  speed:'20 ft',  str:13,dex:6,con:16, int:3,wis:6,cha:5,  attacks:'Slam +3, 1d6+1',                            traits:'Undead Fortitude (DC 5+dmg CON to stay at 1 HP)' },
  { name:'Ghoul',          cr:'1',   type:'Undead',      size:'Medium', hp:22,  ac:12, speed:'30 ft',  str:13,dex:15,con:10,int:7,wis:10,cha:6,  attacks:'Bite +2, 2d6 / Claws +4, 2d4+2 + paralysis',traits:'Paralyzing Claws DC10 CON, immune to charm/exhaustion' },
  { name:'Shadow',         cr:'1/2', type:'Undead',      size:'Medium', hp:16,  ac:12, speed:'40 ft',  str:6,dex:14,con:13,int:6,wis:10,cha:8,  attacks:'Strength Drain +4, 2d6+2 + STR reduction',  traits:'Sunlight Weakness, Amorphous, STR drain on kill spawns shadow' },
  { name:'Specter',        cr:'1',   type:'Undead',      size:'Medium', hp:22,  ac:12, speed:'50 ft',  str:1,dex:14,con:11,int:10,wis:10,cha:11, attacks:'Life Drain +4, 3d6 necrotic + max HP reduction',traits:'Incorporeal Movement, Sunlight Sensitivity' },
  { name:'Wight',          cr:'3',   type:'Undead',      size:'Medium', hp:45,  ac:14, speed:'30 ft',  str:15,dex:14,con:16,int:10,wis:13,cha:15, attacks:'Longsword +4, 1d8+2 / Life Drain +4, 1d6+2 + HP max reduction',traits:'Life Drain, Create Zombie (on kill)' },
  { name:'Wraith',         cr:'5',   type:'Undead',      size:'Medium', hp:67,  ac:13, speed:'60 ft',  str:6,dex:16,con:16,int:12,wis:14,cha:15, attacks:'Life Drain +6, 4d8+3 + max HP reduction',   traits:'Incorporeal, Create Specter, Sunlight Hypersensitivity' },
  { name:'Vampire Spawn',  cr:'5',   type:'Undead',      size:'Medium', hp:82,  ac:15, speed:'30 ft',  str:16,dex:16,con:16,int:11,wis:10,cha:12, attacks:'Claws +6, 2d4+3 / Bite +6, 1d6+3 + 10 drain',traits:'Regen 10/round, Spider Climb, Charming Gaze' },
  { name:'Vampire',        cr:'13',  type:'Undead',      size:'Medium', hp:144, ac:16, speed:'30 ft',  str:18,dex:18,con:18,int:17,wis:15,cha:18, attacks:'Unarmed ×2 +9, 1d8+4 / Bite +9, 1d6+4 + 20 drain',traits:'Regen 20, Legendary Actions ×3, Shapechange, Charm' },
  { name:'Lich',           cr:'21',  type:'Undead',      size:'Medium', hp:135, ac:17, speed:'30 ft',  str:11,dex:16,con:16,int:20,wis:17,cha:16, attacks:'Paralyzing Touch +12, 3d6 cold + paralysis',traits:'Legendary Resistance ×3, Spellcasting (9th level), Phylactery' },
  // Fiends
  { name:'Imp',            cr:'1',   type:'Fiend',       size:'Tiny',   hp:10,  ac:13, speed:'20/40 ft',str:6,dex:17,con:13,int:11,wis:12,cha:14, attacks:'Sting +5, 1d4+3 + 3d4 poison DC11',       traits:'Shapechanger, Devil\'s Sight, Invisibility' },
  { name:'Quasit',         cr:'1',   type:'Fiend',       size:'Tiny',   hp:7,   ac:13, speed:'40 ft',  str:5,dex:17,con:10,int:7,wis:10,cha:10, attacks:'Claws +4, 1d4+3 + DC10 CON poison',         traits:'Shapechanger, Magic Resistance, Invisibility' },
  { name:'Bearded Devil',  cr:'3',   type:'Fiend',       size:'Medium', hp:52,  ac:13, speed:'30 ft',  str:16,dex:15,con:15,int:9,wis:11,cha:11, attacks:'Beard +5, 1d8+3 + disease / Glaive +5, 1d10+3',traits:'Devil\'s Sight, Magic Resistance, Steadfast' },
  { name:'Succubus/Incubus',cr:'4',  type:'Fiend',       size:'Medium', hp:66,  ac:13, speed:'30/60 ft',str:8,dex:17,con:13,int:15,wis:12,cha:20, attacks:'Claws +5, 2d4+3 / Draining Kiss',         traits:'Shapechanger, Charm, Magic Resistance, Draining Kiss' },
  { name:'Balor',          cr:'19',  type:'Fiend',       size:'Huge',   hp:262, ac:19, speed:'40/80 ft',str:26,dex:15,con:22,int:20,wis:16,cha:22,attacks:'Longsword +14, 3d8+8 fire / Whip +14, 2d6+8',traits:'Fire Aura, Magic Resistance, Legendary Actions, Death Throes' },
  // Dragons
  { name:'Dragon Wyrmling (Red)',cr:'4',type:'Dragon',   size:'Medium', hp:75,  ac:17, speed:'30/60 ft',str:19,dex:10,con:17,int:12,wis:11,cha:15,attacks:'Bite +6, 1d10+4 fire / Claws +6, 2d6+4',   traits:'Fire Breath 15ft cone DC13, 7d6 fire' },
  { name:'Young Red Dragon',cr:'10', type:'Dragon',      size:'Large',  hp:178, ac:18, speed:'40/80 ft',str:23,dex:10,con:21,int:14,wis:11,cha:19,attacks:'Bite +10, 2d10+6 / Claws ×2 +10, 2d6+6',   traits:'Multiattack, Fire Breath 30ft cone DC17 10d6, Frightful Presence' },
  { name:'Adult Red Dragon', cr:'17',type:'Dragon',      size:'Huge',   hp:256, ac:19, speed:'40/80 ft',str:27,dex:10,con:25,int:16,wis:13,cha:21,attacks:'Bite +14, 2d10+8 / Wing Attack +14',         traits:'Legendary Actions ×3, Fire Breath 60ft cone DC21 18d6' },
  { name:'Ancient Red Dragon',cr:'24',type:'Dragon',     size:'Gargantuan',hp:546,ac:22,speed:'40/80 ft',str:30,dex:10,con:29,int:18,wis:15,cha:23,attacks:'Bite +17, 4d10+10',                        traits:'Legendary Resistance ×3, Legendary Actions ×3, Fire Breath DC24 26d6' },
  { name:'Young Green Dragon',cr:'8',type:'Dragon',      size:'Large',  hp:136, ac:18, speed:'40/80 ft',str:19,dex:12,con:17,int:16,wis:13,cha:15,attacks:'Bite +7, 2d10+4 / Claws ×2 +7, 2d6+4',     traits:'Poison Breath 30ft cone DC14 12d6, Amphibious' },
  { name:'Young Blue Dragon', cr:'9',type:'Dragon',      size:'Large',  hp:152, ac:18, speed:'40/80 ft',str:21,dex:10,con:19,int:14,wis:13,cha:17,attacks:'Bite +9, 2d10+5 / Claws ×2 +9, 2d6+5',     traits:'Lightning Breath 60ft line DC16 10d10' },
  // Giants
  { name:'Ogre',           cr:'2',   type:'Giant',       size:'Large',  hp:59,  ac:11, speed:'40 ft',  str:19,dex:8,con:16, int:5,wis:7,cha:7,  attacks:'Greatclub +6, 2d8+4 / Javelin +6, 2d6+4',   traits:'—' },
  { name:'Troll',          cr:'5',   type:'Giant',       size:'Large',  hp:84,  ac:15, speed:'30 ft',  str:18,dex:13,con:20,int:7,wis:9,cha:7,  attacks:'Claws ×2 +7, 2d6+4 / Bite +7, 1d6+4',       traits:'Regen 10/round (acid or fire stops it), Multiattack' },
  { name:'Hill Giant',     cr:'5',   type:'Giant',       size:'Huge',   hp:105, ac:13, speed:'40 ft',  str:21,dex:8,con:19, int:5,wis:9,cha:6,  attacks:'Greatclub ×2 +8, 3d8+5 / Rock +8, 3d10+5',  traits:'Multiattack' },
  { name:'Stone Giant',    cr:'7',   type:'Giant',       size:'Huge',   hp:126, ac:17, speed:'40 ft',  str:23,dex:15,con:19,int:10,wis:12,cha:9,  attacks:'Greatclub ×2 +9, 3d8+6 / Rock +9, 4d10+6', traits:'Stone Camouflage, Multiattack, Catch Rock' },
  { name:'Frost Giant',    cr:'8',   type:'Giant',       size:'Huge',   hp:138, ac:15, speed:'40 ft',  str:23,dex:9,con:21, int:9,wis:10,cha:12, attacks:'Greataxe ×2 +9, 3d12+6 / Rock +9, 4d10+6', traits:'Multiattack' },
  { name:'Cloud Giant',    cr:'9',   type:'Giant',       size:'Huge',   hp:200, ac:14, speed:'40 ft',  str:27,dex:10,con:22,int:12,wis:16,cha:16, attacks:'Morningstar ×2 +12, 3d8+8 / Rock +12, 4d10+8',traits:'Keen Smell, Innate Spellcasting' },
  { name:'Storm Giant',    cr:'13',  type:'Giant',       size:'Huge',   hp:230, ac:16, speed:'50/50 ft',str:29,dex:14,con:20,int:16,wis:18,cha:18,attacks:'Greatsword ×2 +14, 6d6+9 / Rock +14, 4d12+9',traits:'Amphibious, Innate Spellcasting, Lightning Strike' },
  // Aberrations
  { name:'Mind Flayer',    cr:'7',   type:'Aberration',  size:'Medium', hp:71,  ac:15, speed:'30 ft',  str:11,dex:12,con:12,int:19,wis:17,cha:17, attacks:'Tentacles +7, 2d10+4 + DC15 INT grapple',  traits:'Mind Blast DC15 30ft cone, Extract Brain, Psionic, Detect Thoughts' },
  { name:'Beholder',       cr:'13',  type:'Aberration',  size:'Large',  hp:180, ac:18, speed:'0/20 ft',str:10,dex:14,con:18,int:17,wis:15,cha:17, attacks:'Bite +5, 4d6 / Eye Rays ×3 (10 effects)',  traits:'Legendary Actions, Antimagic Cone (central eye)' },
  { name:'Aboleth',        cr:'10',  type:'Aberration',  size:'Large',  hp:135, ac:17, speed:'10/40 ft',str:21,dex:9,con:15,int:18,wis:15,cha:18, attacks:'Tentacles ×3 +9, 2d6+5 + mucus DC14',      traits:'Enslave DC14, Mucus Cloud, Legendary Actions ×3' },
  { name:'Intellect Devourer',cr:'2',type:'Aberration',  size:'Tiny',   hp:21,  ac:12, speed:'40 ft',  str:6,dex:14,con:13,int:12,wis:11,cha:10, attacks:'Claws +4, 2d6+2 / Devour Intellect DC12',  traits:'Detect Sentience, Body Thief, Magic Resistance' },
  // Constructs & Others
  { name:'Animated Armor', cr:'1',   type:'Construct',   size:'Medium', hp:33,  ac:18, speed:'25 ft',  str:14,dex:11,con:13,int:1,wis:3,cha:1,   attacks:'Slam ×2 +4, 1d6+2',                         traits:'Antimagic Susceptibility, False Appearance, Multiattack' },
  { name:'Shield Guardian',cr:'7',   type:'Construct',   size:'Large',  hp:142, ac:17, speed:'30 ft',  str:18,dex:8,con:18, int:7,wis:10,cha:3,   attacks:'Fist ×2 +7, 2d6+4',                        traits:'Bound, Regenerate 10, Spell Storing, Shield' },
  { name:'Gelatinous Cube', cr:'2',  type:'Ooze',        size:'Large',  hp:84,  ac:6,  speed:'15 ft',  str:14,dex:3,con:20, int:1,wis:6,cha:1,   attacks:'Pseudopod +4, 3d6 acid + DC12 engulf',       traits:'Engulf DC12, Transparent, Ooze Cube' },
  { name:'Mimic',           cr:'2',  type:'Monstrosity', size:'Medium', hp:58,  ac:12, speed:'15 ft',  str:17,dex:12,con:15,int:5,wis:13,cha:8,  attacks:'Pseudopod +5, 1d8+3 + adhesive / Bite +5, 1d8+3+3d4 acid',traits:'Adhesive, False Appearance, Grappler' },
  { name:'Will-o\'-Wisp',   cr:'2',  type:'Undead',      size:'Tiny',   hp:22,  ac:19, speed:'50 ft',  str:1,dex:28,con:10, int:13,wis:14,cha:11, attacks:'Shock +4, 2d8 lightning',                   traits:'Consume Life, Ephemeral, Variable Illumination, Resistance all non-magical' },
  { name:'Roc',             cr:'11', type:'Monstrosity', size:'Gargantuan',hp:248,ac:15,speed:'20/120 ft',str:28,dex:10,con:20,int:3,wis:10,cha:9,attacks:'Beak +13, 4d8+9 / Talons +13, 4d6+9',       traits:'Keen Sight, Multiattack, Grapple on Talon' },
];

// ─────────────────────────────────────────────────────────────
//  THEMES
// ─────────────────────────────────────────────────────────────
const THEMES = [
  { id:'dark',      name:'Dark Dungeon',  bg:'#0f0d0a', accent:'#d4a843', preview:'linear-gradient(135deg,#0f0d0a 60%,#2a1e08)' },
  { id:'forest',    name:'Forest Grove',  bg:'#080f08', accent:'#5a9e5a', preview:'linear-gradient(135deg,#080f08 60%,#0d2010)' },
  { id:'arcane',    name:'Arcane Purple', bg:'#0a080f', accent:'#a78bfa', preview:'linear-gradient(135deg,#0a080f 60%,#1a0d2a)' },
  { id:'blood',     name:'Blood Moon',    bg:'#0f0505', accent:'#cc3333', preview:'linear-gradient(135deg,#0f0505 60%,#2a0808)' },
  { id:'ice',       name:'Ice Kingdom',   bg:'#050a14', accent:'#60a8d8', preview:'linear-gradient(135deg,#050a14 60%,#0a1e30)' },
  { id:'parchment', name:'Parchment',     bg:'#f4e8c1', accent:'#6b4c14', preview:'linear-gradient(135deg,#f4e8c1 60%,#e8d090)' },
];

// ─────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, duration = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), duration);
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h.toString(16);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

function crToNum(cr) {
  if (cr === '1/8') return 0.125;
  if (cr === '1/4') return 0.25;
  if (cr === '1/2') return 0.5;
  return parseFloat(cr) || 0;
}

function compareSessions(a, b) {
  const aTime = new Date(`${a.date || '1970-01-01'}T00:00:00`).getTime() || 0;
  const bTime = new Date(`${b.date || '1970-01-01'}T00:00:00`).getTime() || 0;
  if (aTime !== bTime) return aTime - bTime;

  const aCreated = new Date(a.createdAt || 0).getTime() || 0;
  const bCreated = new Date(b.createdAt || 0).getTime() || 0;
  if (aCreated !== bCreated) return aCreated - bCreated;

  return (a.id || 0) - (b.id || 0);
}

function normalizeSession(session) {
  return {
    ...session,
    campaignId: session.campaignId ?? null,
    campaignName: session.campaignName ?? '',
    carriedFromSessionId: session.carriedFromSessionId ?? null,
    carriedItems: normalizeCarryMap(session.carriedItems),
    progress: normalizeProgressMap(session.progress),
    pcs: Array.isArray(session.pcs) ? session.pcs.map(p => ({ ...p })) : [],
    npcs: Array.isArray(session.npcs) ? session.npcs.map(n => ({ ...n })) : [],
    locations: Array.isArray(session.locations) ? [...session.locations] : [],
    encounters: Array.isArray(session.encounters) ? session.encounters.map(e => ({ ...e })) : [],
    loot: Array.isArray(session.loot) ? [...session.loot] : [],
    plot: Array.isArray(session.plot) ? [...session.plot] : [],
    notes: Array.isArray(session.notes) ? [...session.notes] : [],
  };
}

function normalizeCampaign(campaign) {
  return {
    id: campaign.id,
    name: campaign.name,
    createdAt: campaign.createdAt || new Date().toISOString(),
  };
}

function getCampaignById(id) {
  return S.campaigns.find(c => c.id === id) || null;
}

function getCampaignNameById(id) {
  return getCampaignById(id)?.name || '';
}

function getSessionCampaignLabel(session) {
  if (session.campaignId) return getCampaignNameById(session.campaignId) || session.campaignName || 'Campaign';
  return session.campaignName || 'Standalone';
}

function getCampaignSessions(campaignId) {
  return S.sessions.filter(s => s.campaignId === campaignId).sort(compareSessions);
}

function getLatestSessionInCampaign(campaignId) {
  const sessions = getCampaignSessions(campaignId);
  return sessions.length ? sessions[sessions.length - 1] : null;
}

function dedupeMerge(existing, incoming, serialize) {
  const seen = new Set(existing.map(serialize));
  const merged = [...existing];
  incoming.forEach(item => {
    const key = serialize(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  });
  return merged;
}

function getPrepItemLabel(key, item) {
  if (key === 'pcs') return item.classLevel ? `${item.name} (${item.classLevel})` : item.name;
  if (key === 'npcs') return item.role ? `${item.name} (${item.role})` : item.name;
  if (key === 'encounters') return item.cr ? `${item.name} [${item.cr}]` : item.name;
  return typeof item === 'string' ? item : (item.name || JSON.stringify(item));
}

function getSessionItemKey(category, item) {
  if (category === 'pcs') return `${(item.name || '').trim().toLowerCase()}|${(item.classLevel || '').trim().toLowerCase()}|${(item.notes || '').trim().toLowerCase()}`;
  if (category === 'npcs') return `${(item.name || '').trim().toLowerCase()}|${(item.role || '').trim().toLowerCase()}|${(item.notes || '').trim().toLowerCase()}`;
  if (category === 'encounters') return `${(item.name || '').trim().toLowerCase()}|${(item.cr || '').trim().toLowerCase()}|${(item.notes || '').trim().toLowerCase()}`;
  return String(item).trim().toLowerCase();
}

function normalizeCarryMap(raw = {}) {
  const keys = ['pcs','npcs','locations','encounters','loot','plot','notes'];
  return Object.fromEntries(keys.map(key => [key, Array.isArray(raw[key]) ? [...raw[key]] : []]));
}

function normalizeProgressMap(raw = {}) {
  const keys = ['pcs','npcs','locations','encounters','loot','plot','notes'];
  return Object.fromEntries(keys.map(key => [key, Array.isArray(raw[key]) ? [...raw[key]] : []]));
}

function renderPrepPills() {
  const listMap = {
    pcs:'pc-pills',
    npcs:'npc-pills',
    locations:'loc-pills',
    encounters:'enc-pills',
    loot:'loot-pills',
    plot:'plot-pills',
    notes:'note-pills',
  };

  Object.entries(listMap).forEach(([key, listId]) => {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '';
    S.prep[key].forEach((item, i) => appendPill(listId, getPrepItemLabel(key, item), key, i));
  });
}

function hasPrepContent() {
  return Boolean(
    document.getElementById('p-title')?.value.trim() ||
    document.getElementById('p-setting')?.value.trim() ||
    Object.values(S.prep).some(arr => arr.length)
  );
}

function renderCampaignOptions(selectedValue = '') {
  const select = document.getElementById('p-campaign');
  if (!select) return;

  select.innerHTML = [
    '<option value="">Standalone Session</option>',
    '<option value="__new__">+ Create New Campaign</option>',
    ...[...S.campaigns]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(c => `<option value="${c.id}">${esc(c.name)}</option>`)
  ].join('');

  select.value = String(selectedValue || '');
}

function updateCarryForwardNotice() {
  const note = document.getElementById('carry-forward-note');
  const selected = document.getElementById('p-campaign')?.value || '';
  const carry = document.getElementById('p-carry-forward')?.checked;
  const newName = document.getElementById('p-new-campaign')?.value.trim();

  if (!note) return;
  if (!carry) {
    note.textContent = 'Carry-over is off. This session will start fresh.';
    return;
  }
  if (!selected) {
    note.textContent = 'Choose a campaign to continue its story into the next session.';
    return;
  }
  if (selected === '__new__') {
    note.textContent = newName
      ? `A new campaign called "${newName}" will start with this session.`
      : 'Name the new campaign to start its first session.';
    return;
  }

  const campaignId = parseInt(selected, 10);
  const previous = getLatestSessionInCampaign(campaignId);
  note.textContent = previous
    ? `The latest session from "${getCampaignNameById(campaignId)}" can be carried into this one.`
    : `This will be the first saved session for "${getCampaignNameById(campaignId)}".`;
}

function ensureCampaign(name) {
  const cleanName = name.trim();
  if (!cleanName) return null;

  const existing = S.campaigns.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;

  const nextId = S.campaigns.length ? Math.max(...S.campaigns.map(c => c.id)) + 1 : 1;
  const campaign = { id: nextId, name: cleanName, createdAt: new Date().toISOString() };
  S.campaigns.push(campaign);
  saveCampaignsToLS();
  return campaign;
}

function mergePreviousSessionIntoPrep(previous) {
  S.prep.pcs = dedupeMerge(
    S.prep.pcs,
    (previous.pcs || []).map(p => ({ ...p })),
    p => `${(p.name || '').trim().toLowerCase()}|${(p.classLevel || '').trim().toLowerCase()}|${(p.notes || '').trim().toLowerCase()}`
  );
  S.prep.npcs = dedupeMerge(
    S.prep.npcs,
    (previous.npcs || []).map(n => ({ ...n })),
    n => `${(n.name || '').trim().toLowerCase()}|${(n.role || '').trim().toLowerCase()}|${(n.notes || '').trim().toLowerCase()}`
  );
  S.prep.locations = dedupeMerge(S.prep.locations, [...(previous.locations || [])], i => i.trim().toLowerCase());
  S.prep.encounters = dedupeMerge(
    S.prep.encounters,
    (previous.encounters || []).map(e => ({ ...e })),
    e => `${(e.name || '').trim().toLowerCase()}|${(e.cr || '').trim().toLowerCase()}|${(e.notes || '').trim().toLowerCase()}`
  );
  S.prep.loot = dedupeMerge(S.prep.loot, [...(previous.loot || [])], i => i.trim().toLowerCase());
  S.prep.plot = dedupeMerge(S.prep.plot, [...(previous.plot || [])], i => i.trim().toLowerCase());
  S.prep.notes = dedupeMerge(S.prep.notes, [...(previous.notes || [])], i => i.trim().toLowerCase());

  const setting = document.getElementById('p-setting');
  if (setting && !setting.value.trim() && previous.setting) setting.value = previous.setting;
}

function carryForwardFromSelectedCampaign(forceToast = false) {
  const carry = document.getElementById('p-carry-forward')?.checked;
  const selected = document.getElementById('p-campaign')?.value || '';
  if (!carry || !selected || selected === '__new__') {
    updateCarryForwardNotice();
    return;
  }

  const campaignId = parseInt(selected, 10);
  if (!campaignId || S.prepCarrySource === campaignId) {
    updateCarryForwardNotice();
    return;
  }

  const previous = getLatestSessionInCampaign(campaignId);
  if (!previous) {
    updateCarryForwardNotice();
    return;
  }

  const hadContentBefore = hasPrepContent();
  mergePreviousSessionIntoPrep(previous);
  renderPrepPills();
  S.prepCarrySource = campaignId;
  updateCarryForwardNotice();
  if (forceToast || hadContentBefore) showToast(`Pulled forward notes from "${previous.title}".`);
}

function onCampaignSelectionChange() {
  const select = document.getElementById('p-campaign');
  const wrap = document.getElementById('p-new-campaign-wrap');
  if (!select || !wrap) return;

  wrap.style.display = select.value === '__new__' ? '' : 'none';
  if (select.value !== '__new__') document.getElementById('p-new-campaign').value = '';
  S.prepCarrySource = null;
  updateCarryForwardNotice();
  carryForwardFromSelectedCampaign(false);
}

function renderCampaignPage() {
  const el = document.getElementById('campaign-list');
  if (!el) return;

  if (!S.campaigns.length) {
    el.innerHTML = `
      <div class="card empty-state">
        <div class="empty-icon">🏰</div>
        <p>No campaigns yet</p>
        <small>Create one from <a href="#" onclick="navigate('prep')">Session Prep</a> when you save a session.</small>
      </div>`;
    return;
  }

  el.innerHTML = S.campaigns
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(campaign => {
      const sessions = getCampaignSessions(campaign.id);
      const totalPCs = sessions.reduce((sum, s) => sum + (s.pcs?.length || 0), 0);
      const totalNPCs = sessions.reduce((sum, s) => sum + (s.npcs?.length || 0), 0);
      const totalHooks = sessions.reduce((sum, s) => sum + (s.plot?.length || 0), 0);
      const latest = sessions[sessions.length - 1];
      return `
        <div class="card">
          <div class="campaign-header-row">
            <div>
              <div class="card-title" style="margin-bottom:0.55rem;">🏰 ${esc(campaign.name)}</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
                <span class="tag">${sessions.length} session${sessions.length === 1 ? '' : 's'}</span>
                <span class="tag">${totalPCs} PCs</span>
                <span class="tag blue">${totalNPCs} NPCs</span>
                <span class="tag purple">${totalHooks} hooks</span>
                ${latest ? `<span class="tag">Latest: ${formatDate(latest.date)}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" onclick="openCampaignModal(${campaign.id})">Rename</button>
              <button class="btn btn-gold btn-sm" onclick="startSessionForCampaign(${campaign.id})">New Session</button>
            </div>
          </div>
          <div class="campaign-session-grid" style="margin-top:0.9rem;">
            ${sessions.map((s, index) => `
              <div class="campaign-session-card">
                <div class="flex-between" style="gap:0.6rem;align-items:flex-start;">
                  <div>
                    <strong style="display:block;font-size:0.94rem;">${esc(s.title)}</strong>
                    <span style="font-size:0.78rem;color:var(--text-muted);">${formatDate(s.date)}</span>
                  </div>
                  <span class="tag">Session ${index + 1}</span>
                </div>
                ${s.setting ? `<p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.45rem;">📍 ${esc(s.setting)}</p>` : ''}
                <div style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-top:0.55rem;">
                  ${(s.carriedItems?.pcs?.length || s.carriedItems?.plot?.length || s.carriedItems?.loot?.length || s.carriedItems?.encounters?.length || s.carriedItems?.npcs?.length || s.carriedItems?.locations?.length || s.carriedItems?.notes?.length) ? `<span class="tag green">Continues story</span>` : ''}
                  ${s.progress?.plot?.length ? `<span class="tag green">${s.progress.plot.length} hook${s.progress.plot.length === 1 ? '' : 's'} done</span>` : ''}
                </div>
                <div style="display:flex;gap:0.45rem;margin-top:0.7rem;">
                  <button class="btn btn-outline btn-sm" onclick="openSessionInDM(${s.id})">Open</button>
                  <button class="btn btn-ghost btn-sm" onclick="navigate('prep'); setTimeout(() => startSessionForCampaign(${campaign.id}), 0);">Continue</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }).join('');
}

function openCampaignModal(campaignId) {
  const campaign = getCampaignById(campaignId);
  if (!campaign) return;
  const html = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-title">🏰 Rename Campaign</div>
        <div class="form-group">
          <label>Campaign Name</label>
          <input type="text" id="campaign-name" value="${esc(campaign.name)}" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-gold" onclick="saveCampaignName(${campaign.id})">Save</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modal-container').innerHTML = html;
}

function saveCampaignName(campaignId) {
  const campaign = getCampaignById(campaignId);
  const input = document.getElementById('campaign-name');
  if (!campaign || !input) return;

  const name = input.value.trim();
  if (!name) { showToast('Please enter a campaign name.'); return; }

  const dupe = S.campaigns.find(c => c.id !== campaignId && c.name.toLowerCase() === name.toLowerCase());
  if (dupe) { showToast('That campaign name is already in use.'); return; }

  campaign.name = name;
  S.sessions.forEach(session => {
    if (session.campaignId === campaignId) session.campaignName = name;
  });
  saveCampaignsToLS();
  saveSessionsToLS();
  renderCampaignOptions(campaignId);
  renderDashboard();
  renderPrepSessionList();
  renderDMSessionList();
  renderCampaignPage();
  if (S.activeSession?.campaignId === campaignId) renderDMContent();
  closeModal();
  showToast('Campaign renamed.');
}

function startSessionForCampaign(campaignId) {
  navigate('prep');
  resetPrepForm();
  renderCampaignOptions(campaignId);
  document.getElementById('p-campaign').value = String(campaignId);
  onCampaignSelectionChange();
}

function isCarriedItem(session, category, item) {
  return Boolean(session.carriedItems?.[category]?.includes(getSessionItemKey(category, item)));
}

function isCompletedItem(session, category, item) {
  return Boolean(session.progress?.[category]?.includes(getSessionItemKey(category, item)));
}

function toggleSessionItemProgress(sessionId, category, index) {
  const session = S.sessions.find(s => s.id === sessionId);
  if (!session) return;
  const item = session[category]?.[index];
  if (!item) return;

  const key = getSessionItemKey(category, item);
  session.progress ||= normalizeProgressMap();
  session.progress[category] ||= [];

  if (session.progress[category].includes(key)) {
    session.progress[category] = session.progress[category].filter(k => k !== key);
  } else {
    session.progress[category].push(key);
  }

  if (S.activeSession?.id === sessionId) S.activeSession = session;
  saveSessionsToLS();
  renderDMContent();
  renderCampaignPage();
}

// ─────────────────────────────────────────────────────────────
//  STORAGE
// ─────────────────────────────────────────────────────────────
const LS_PREFIX = 'dmforge_';

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + key)); } catch { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch(e) { console.error(e); }
}

function loadUserData() {
  const storedSessions = lsGet(`${S.user.username}_sessions`) || [];
  const storedCampaigns = lsGet(`${S.user.username}_campaigns`) || [];

  S.sessions  = storedSessions.map(normalizeSession);
  S.factions  = lsGet(`${S.user.username}_factions`) || [];
  S.theme     = lsGet(`${S.user.username}_theme`)    || 'dark';
  S.rollHistory = lsGet(`${S.user.username}_rolls`)  || [];

  const campaignMap = new Map();
  storedCampaigns.map(normalizeCampaign).forEach(c => campaignMap.set(c.id, c));
  S.sessions.forEach(session => {
    if (session.campaignId && !campaignMap.has(session.campaignId)) {
      campaignMap.set(session.campaignId, {
        id: session.campaignId,
        name: session.campaignName || `Campaign ${session.campaignId}`,
        createdAt: session.createdAt || new Date().toISOString(),
      });
    }
  });
  S.campaigns = [...campaignMap.values()].sort((a, b) => a.id - b.id);
}

function saveSessionsToLS()  { lsSet(`${S.user.username}_sessions`,  S.sessions); }
function saveCampaignsToLS() { lsSet(`${S.user.username}_campaigns`, S.campaigns); }
function saveFactionsToLS()  { lsSet(`${S.user.username}_factions`,  S.factions); }
function saveThemeToLS()     { lsSet(`${S.user.username}_theme`,     S.theme); }
function saveRollsToLS()     { lsSet(`${S.user.username}_rolls`,     S.rollHistory); }

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────
function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-login').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('tab-register').style.display = tab === 'register' ? '' : 'none';
  event.target.classList.add('active');
  document.getElementById('login-error').style.display = 'none';
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) { showLoginError('Please fill in both fields.'); return; }

  const users = lsGet('users') || {};
  const user  = users[username.toLowerCase()];

  if (!user) { showLoginError('Username not found. Create an account first.'); return; }
  if (user.passwordHash !== simpleHash(password)) { showLoginError('Incorrect password.'); return; }

  S.user = { username: user.username };
  lsSet('currentUser', S.user);
  launchApp();
}

function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;

  if (!username || !password) { showLoginError('Please fill in all fields.'); return; }
  if (username.length < 3)    { showLoginError('Username must be at least 3 characters.'); return; }
  if (password.length < 4)    { showLoginError('Password must be at least 4 characters.'); return; }
  if (password !== confirm)   { showLoginError('Passwords do not match.'); return; }

  const users = lsGet('users') || {};
  if (users[username.toLowerCase()]) { showLoginError('Username already taken.'); return; }

  users[username.toLowerCase()] = { username, passwordHash: simpleHash(password) };
  lsSet('users', users);

  S.user = { username };
  lsSet('currentUser', S.user);
  launchApp();
}

function doLogout() {
  lsSet('currentUser', null);
  S.user = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  showToast('Logged out.');
}

function confirmClearData() {
  if (!confirm(`Delete ALL data for "${S.user.username}"? This cannot be undone.`)) return;
  lsSet(`${S.user.username}_sessions`,  []);
  lsSet(`${S.user.username}_campaigns`, []);
  lsSet(`${S.user.username}_factions`,  []);
  lsSet(`${S.user.username}_rolls`,     []);
  S.sessions = []; S.campaigns = []; S.factions = []; S.rollHistory = [];
  renderDashboard();
  renderCampaignPage();
  renderPrepSessionList();
  renderDMSessionList();
  renderFactions();
  showToast('All data cleared.');
}

function launchApp() {
  loadUserData();
  applyTheme(S.theme);

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Avatar initials
  const av = document.getElementById('nav-avatar');
  av.textContent = S.user.username.charAt(0).toUpperCase();

  navigate('dashboard');
  renderCampaignOptions();
  renderMonsterTable();
  renderThemePage();
}

// ─────────────────────────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Refresh data-dependent pages
  if (page === 'dashboard') renderDashboard();
  if (page === 'campaigns') renderCampaignPage();
  if (page === 'prep')      { renderPrepSessionList(); resetPrepForm(); }
  if (page === 'dm')        { renderDMSessionList(); }
  if (page === 'factions')  renderFactions();
  if (page === 'themes')    renderThemePage();
}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderDashboard() {
  // Greeting
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').textContent = `${greet}, ${S.user.username}!`;

  // Stats
  const totalPCs  = S.sessions.reduce((a,s) => a + (s.pcs||[]).length, 0);
  const totalNPCs = S.sessions.reduce((a,s) => a + (s.npcs||[]).length, 0);
  const totalEncs = S.sessions.reduce((a,s) => a + (s.encounters||[]).length, 0);
  document.getElementById('stat-strip').innerHTML = `
    <div class="stat-card" style="border-left:3px solid var(--gold);">
      <div class="stat-label">📜 SESSIONS</div>
      <div class="stat-value">${S.sessions.length}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--accent3);">
      <div class="stat-label">🏰 CAMPAIGNS</div>
      <div class="stat-value">${S.campaigns.length}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--accent);">
      <div class="stat-label">🛡 PCS</div>
      <div class="stat-value">${totalPCs}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--accent4);">
      <div class="stat-label">🧙 NPCS</div>
      <div class="stat-value">${totalNPCs}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--gold);">
      <div class="stat-label">⚔ ENCOUNTERS</div>
      <div class="stat-value">${totalEncs}</div>
    </div>
    <div class="stat-card" style="border-left:3px solid var(--accent2);">
      <div class="stat-label">⚜ FACTIONS</div>
      <div class="stat-value">${S.factions.length}</div>
    </div>
  `;

  // Session cards
  const container = document.getElementById('dash-sessions');
  if (!S.sessions.length) {
    container.innerHTML = `
      <div class="card empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">🎲</div>
        <p>No sessions yet!</p>
        <small>Head to <a href="#" onclick="navigate('prep')">Session Prep</a> to create your first one.</small>
      </div>`;
    return;
  }

  container.innerHTML = [...S.sessions].reverse().map(s => `
    <div class="card" style="display:flex;flex-direction:column;gap:0.5rem;">
      <div class="flex-between">
        <h3 style="font-size:0.98rem;">${esc(s.title)}</h3>
        <span class="tag">${formatDate(s.date)}</span>
      </div>
      <div>
        <span class="tag purple">🏰 ${esc(getSessionCampaignLabel(s))}</span>
        ${s.campaignId ? `<span class="tag">Session ${getCampaignSessions(s.campaignId).findIndex(cs => cs.id === s.id) + 1}</span>` : ''}
      </div>
      ${s.setting ? `<p style="color:var(--text-muted);font-size:0.85rem;">📍 ${esc(s.setting)}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:0.2rem;">
        ${s.pcs?.length        ? `<span class="tag">🛡 ${s.pcs.length} PCs</span>` : ''}
        ${s.npcs?.length       ? `<span class="tag blue">🧙 ${s.npcs.length} NPCs</span>` : ''}
        ${s.locations?.length  ? `<span class="tag green">📍 ${s.locations.length} Locations</span>` : ''}
        ${s.encounters?.length ? `<span class="tag red">⚔ ${s.encounters.length} Encounters</span>` : ''}
        ${s.loot?.length       ? `<span class="tag">💰 ${s.loot.length} Loot</span>` : ''}
        ${s.plot?.length       ? `<span class="tag purple">🎭 ${s.plot.length} Hooks</span>` : ''}
      </div>
      <div style="display:flex;gap:0.4rem;margin-top:auto;padding-top:0.7rem;border-top:1px solid var(--border);">
        <button class="btn btn-gold btn-sm" onclick="openSessionInDM(${s.id})">Open Screen</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSession(${s.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function openSessionInDM(id) {
  S.activeSession = S.sessions.find(s => s.id === id) || null;
  navigate('dm');
  renderDMContent();
}

// ─────────────────────────────────────────────────────────────
//  SESSION PREP – accordion
// ─────────────────────────────────────────────────────────────
function toggleAcc(head) {
  head.classList.toggle('open');
  const body = head.nextElementSibling;
  body.style.display = head.classList.contains('open') ? '' : 'none';
}

// ─────────────────────────────────────────────────────────────
//  SESSION PREP – form data
// ─────────────────────────────────────────────────────────────
function resetPrepForm() {
  S.prep = { pcs:[], npcs:[], locations:[], encounters:[], loot:[], plot:[], notes:[] };
  S.prepCarrySource = null;
  ['p-title','p-date','p-setting','p-new-campaign','pc-name','pc-class','pc-notes','npc-name','npc-role','npc-notes',
   'loc-input','enc-name','enc-cr','enc-notes','loot-input','plot-input','note-input']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  renderPrepPills();
  renderCampaignOptions();
  document.getElementById('p-campaign').value = '';
  document.getElementById('p-carry-forward').checked = true;
  document.getElementById('p-new-campaign-wrap').style.display = 'none';
  document.getElementById('p-date').valueAsDate = new Date();
  document.getElementById('sorter-results').style.display = 'none';
  document.getElementById('sorter-input').value = '';
  updateCarryForwardNotice();
}

function clearPrepForm() {
  if (!confirm('Clear all entries in the form?')) return;
  resetPrepForm();
}

function addSimple(inputId, key, pillsId) {
  const input = document.getElementById(inputId);
  const val   = input.value.trim();
  if (!val) return;
  S.prep[key].push(val);
  appendPill(pillsId, val, key, S.prep[key].length - 1);
  input.value = '';
  input.focus();
}

function addPC() {
  const name = document.getElementById('pc-name').value.trim();
  const classLevel = document.getElementById('pc-class').value.trim();
  const notes = document.getElementById('pc-notes').value.trim();
  if (!name) { showToast('Enter a player character name.'); return; }
  S.prep.pcs.push({ name, classLevel, notes });
  const label = classLevel ? `${name} (${classLevel})` : name;
  appendPill('pc-pills', label, 'pcs', S.prep.pcs.length - 1);
  ['pc-name','pc-class','pc-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pc-name').focus();
}

function addNPC() {
  const name  = document.getElementById('npc-name').value.trim();
  const role  = document.getElementById('npc-role').value.trim();
  const notes = document.getElementById('npc-notes').value.trim();
  if (!name) { showToast('Enter an NPC name.'); return; }
  S.prep.npcs.push({ name, role, notes });
  const label = role ? `${name} (${role})` : name;
  appendPill('npc-pills', label, 'npcs', S.prep.npcs.length - 1);
  ['npc-name','npc-role','npc-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('npc-name').focus();
}

function addEncounter() {
  const name  = document.getElementById('enc-name').value.trim();
  const cr    = document.getElementById('enc-cr').value.trim();
  const notes = document.getElementById('enc-notes').value.trim();
  if (!name) { showToast('Enter an encounter name.'); return; }
  S.prep.encounters.push({ name, cr, notes });
  const label = cr ? `${name} [${cr}]` : name;
  appendPill('enc-pills', label, 'encounters', S.prep.encounters.length - 1);
  ['enc-name','enc-cr','enc-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('enc-name').focus();
}

function appendPill(listId, text, key, index) {
  const list = document.getElementById(listId);
  const pill = document.createElement('div');
  pill.className = 'pill';
  pill.dataset.key   = key;
  pill.dataset.index = index;
  pill.innerHTML = `<span>${esc(text)}</span><button onclick="removePill(this)" title="Remove">✕</button>`;
  list.appendChild(pill);
}

function removePill(btn) {
  const pill  = btn.closest('.pill');
  const key   = pill.dataset.key;
  const idx   = parseInt(pill.dataset.index, 10);
  S.prep[key].splice(idx, 1);

  // Re-render all pills for this key to fix indexes
  const listMap = {
    pcs:'pc-pills', npcs:'npc-pills', locations:'loc-pills', encounters:'enc-pills',
    loot:'loot-pills', plot:'plot-pills', notes:'note-pills'
  };
  const listId = listMap[key];
  const list   = document.getElementById(listId);
  list.innerHTML = '';
  S.prep[key].forEach((item, i) => {
    appendPill(listId, getPrepItemLabel(key, item), key, i);
  });
}

function saveSession() {
  const title = document.getElementById('p-title').value.trim();
  if (!title) { showToast('Please enter a session title.'); return; }

  const campaignValue = document.getElementById('p-campaign').value;
  const newCampaignName = document.getElementById('p-new-campaign').value.trim();
  const carryForwardEnabled = document.getElementById('p-carry-forward').checked;
  let campaign = null;

  if (campaignValue === '__new__') {
    if (!newCampaignName) { showToast('Please name the new campaign.'); return; }
    campaign = ensureCampaign(newCampaignName);
    renderCampaignOptions(campaign.id);
  } else if (campaignValue) {
    campaign = getCampaignById(parseInt(campaignValue, 10));
  }

  const previous = campaign?.id && carryForwardEnabled ? getLatestSessionInCampaign(campaign.id) : null;
  const carriedItems = previous ? {
    pcs: (previous.pcs || []).map(item => getSessionItemKey('pcs', item)),
    npcs: (previous.npcs || []).map(item => getSessionItemKey('npcs', item)),
    locations: (previous.locations || []).map(item => getSessionItemKey('locations', item)),
    encounters: (previous.encounters || []).map(item => getSessionItemKey('encounters', item)),
    loot: (previous.loot || []).map(item => getSessionItemKey('loot', item)),
    plot: (previous.plot || []).map(item => getSessionItemKey('plot', item)),
    notes: (previous.notes || []).map(item => getSessionItemKey('notes', item)),
  } : normalizeCarryMap();

  const nextId = S.sessions.length ? Math.max(...S.sessions.map(s => s.id)) + 1 : 1;
  const session = {
    id:         nextId,
    campaignId: campaign?.id || null,
    campaignName: campaign?.name || '',
    title,
    date:       document.getElementById('p-date').value,
    setting:    document.getElementById('p-setting').value.trim(),
    pcs:        [...S.prep.pcs],
    npcs:       [...S.prep.npcs],
    locations:  [...S.prep.locations],
    encounters: [...S.prep.encounters],
    loot:       [...S.prep.loot],
    plot:       [...S.prep.plot],
    notes:      [...S.prep.notes],
    carriedItems,
    progress:   normalizeProgressMap(),
    carriedFromSessionId: previous?.id || null,
    createdAt:  new Date().toISOString(),
  };

  S.sessions.push(session);
  saveSessionsToLS();
  saveCampaignsToLS();
  showToast(campaign ? `✅ Session saved to "${campaign.name}"!` : '✅ Session saved!');
  setTimeout(() => navigate('dashboard'), 1000);
}

function deleteSession(id) {
  if (!confirm('Delete this session permanently?')) return;
  S.sessions = S.sessions.filter(s => s.id !== id);
  if (S.activeSession?.id === id) S.activeSession = null;
  saveSessionsToLS();
  renderDashboard();
  renderCampaignPage();
  renderPrepSessionList();
  renderDMSessionList();
  renderDMContent();
  showToast('Session deleted.');
}

function renderPrepSessionList() {
  const el = document.getElementById('prep-session-list');
  if (!S.sessions.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No sessions saved yet.</p>';
    return;
  }
  const campaignBlocks = S.campaigns.map(campaign => {
    const sessions = getCampaignSessions(campaign.id).slice().reverse();
    if (!sessions.length) return '';
    return `
      <div class="campaign-block">
        <h4>🏰 ${esc(campaign.name)}</h4>
        <p>${sessions.length} saved session${sessions.length === 1 ? '' : 's'}</p>
        <div class="session-mini-list">
          ${sessions.map((s, idx) => `
            <div class="session-mini-row">
              <div>
                <p style="font-size:0.88rem;">${esc(s.title)}</p>
                <div class="session-mini-meta">
                  <span class="tag">Session ${sessions.length - idx}</span>
                  <span class="tag">${formatDate(s.date)}</span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="openSessionInDM(${s.id})">Open</button>
            </div>
          `).join('')}
        </div>
      </div>`;
  }).filter(Boolean);

  const standalone = S.sessions.filter(s => !s.campaignId).sort(compareSessions).reverse();
  if (standalone.length) {
    campaignBlocks.push(`
      <div class="campaign-block">
        <h4>🧭 Standalone Sessions</h4>
        <div class="session-mini-list">
          ${standalone.map(s => `
            <div class="session-mini-row">
              <div>
                <p style="font-size:0.88rem;">${esc(s.title)}</p>
                <div class="session-mini-meta">
                  <span class="tag">${formatDate(s.date)}</span>
                </div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="openSessionInDM(${s.id})">Open</button>
            </div>
          `).join('')}
        </div>
      </div>
    `);
  }

  el.innerHTML = `<div class="campaign-stack">${campaignBlocks.join('')}</div>`;
}

// ─────────────────────────────────────────────────────────────
//  SMART TEXT SORTER
// ─────────────────────────────────────────────────────────────
const SORT_PREFIXES = {
  // PCs
  pc:'pcs', pcs:'pcs', player:'pcs', playercharacter:'pcs', partymember:'pcs',
  // NPCs
  npc:'npcs',npcs:'npcs',character:'npcs',ally:'npcs',enemy:'npcs',villain:'npcs',
  merchant:'npcs',guard:'npcs',wizard:'npcs',priest:'npcs',king:'npcs',queen:'npcs',
  ranger:'npcs',rogue:'npcs',bard:'npcs',innkeeper:'npcs',lord:'npcs',lady:'npcs',
  hero:'npcs',captain:'npcs',chief:'npcs',elder:'npcs',
  // Locations
  location:'locations',place:'locations',town:'locations',city:'locations',
  village:'locations',dungeon:'locations',forest:'locations',castle:'locations',
  tavern:'locations',cave:'locations',temple:'locations',ruins:'locations',
  road:'locations',river:'locations',mountain:'locations',tower:'locations',
  inn:'locations',market:'locations',district:'locations',island:'locations',
  // Encounters
  encounter:'encounters',combat:'encounters',fight:'encounters',battle:'encounters',
  monster:'encounters',goblin:'encounters',dragon:'encounters',undead:'encounters',
  orc:'encounters',bandit:'encounters',trap:'encounters',ambush:'encounters',
  boss:'encounters',minion:'encounters',cr:'encounters',
  // Loot
  loot:'loot',treasure:'loot',gold:'loot',gp:'loot',silver:'loot',sp:'loot',
  item:'loot',weapon:'loot',armor:'loot',armour:'loot',potion:'loot',scroll:'loot',
  gem:'loot',ring:'loot',reward:'loot',chest:'loot',artifact:'loot',
  // Plot
  quest:'plot',plot:'plot',hook:'plot',goal:'plot',mission:'plot',objective:'plot',
  rumor:'plot',rumour:'plot',secret:'plot',prophecy:'plot',clue:'plot',
  mystery:'plot',story:'plot',motivation:'plot',foreshadow:'plot',
};

const SORT_KEYWORDS = {
  pcs:        ['pc','player','player character','character sheet','party member','paladin','fighter','cleric','wizard','warlock','sorcerer','rogue','ranger','barbarian','bard','druid','monk'],
  npcs:       ['npc','villain','hero','ally','enemy','merchant','guard','priest','king','queen','lord','lady','innkeeper'],
  locations:  ['location','place','town','city','village','dungeon','forest','castle','tavern','cave','temple','ruins','road','river','mountain','tower','inn','market'],
  encounters: ['encounter','combat','fight','battle','monster','goblin','dragon','undead','orc','bandit','trap','ambush',' hp ',' ac ','initiative'],
  loot:       ['loot','treasure',' gold',' gp ',' silver',' sp ','weapon','armor','armour','potion','scroll',' gem ',' ring ','artifact'],
  plot:       ['quest','plot','hook','goal','mission','objective','rumor','rumour','secret','prophecy','clue','mystery','motivation'],
};

const CAT_INFO = {
  pcs:       { label:'🛡 Player Characters', tag:'',     key:'pcs' },
  npcs:      { label:'🧙 NPCs',        tag:'blue',   key:'npcs' },
  locations: { label:'📍 Locations',   tag:'green',  key:'locations' },
  encounters:{ label:'⚔ Encounters',  tag:'red',    key:'encounters' },
  loot:      { label:'💰 Loot',        tag:'',       key:'loot' },
  plot:      { label:'🎭 Plot Hooks',  tag:'purple', key:'plot' },
  notes:     { label:'📝 Notes',       tag:'',       key:'notes' },
};

function cleanLine(s) { return s.trim().replace(/^[\-\*\•\–\—\s]+/, '').trim(); }

function sortLine(line) {
  let text = cleanLine(line);
  if (!text) return null;
  let category = null;

  // 1. Prefix matching:  "NPC: Mira" or "Quest – find the crown"
  const colonIdx = text.indexOf(':');
  const dashIdx  = text.search(/\s[–—-]\s/);
  const splitAt  = colonIdx !== -1 ? colonIdx : (dashIdx !== -1 ? dashIdx : -1);

  if (splitAt !== -1) {
    const prefix = text.slice(0, splitAt).trim().toLowerCase().replace(/[^a-z]/g,'');
    const rest   = text.slice(splitAt + 1).trim().replace(/^[\–—\-\s]+/, '').trim();
    const mapped = SORT_PREFIXES[prefix];
    if (mapped) { category = mapped; text = rest || text; }
  }

  // 2. Keyword scan
  if (!category) {
    const lower = ' ' + text.toLowerCase() + ' ';
    for (const [cat, kws] of Object.entries(SORT_KEYWORDS)) {
      if (kws.some(kw => lower.includes(kw))) { category = cat; break; }
    }
  }

  return { text: cleanLine(text), category: category || 'notes' };
}

function runSorter() {
  const raw = document.getElementById('sorter-input').value;
  const lines = raw.split(/\r?\n/).map(cleanLine).filter(Boolean);
  if (!lines.length) { showToast('Paste some notes first!'); return; }

  const result = { pcs:[], npcs:[], locations:[], encounters:[], loot:[], plot:[], notes:[] };
  lines.forEach(line => {
    const r = sortLine(line);
    if (r) result[r.category].push(r.text);
  });

  renderSorterResults(result);
}

function clearSorter() {
  document.getElementById('sorter-input').value = '';
  document.getElementById('sorter-results').style.display = 'none';
}

function renderSorterResults(result) {
  const container = document.getElementById('sorter-results');
  let html = '<hr class="divider" />';
  let hasAny = false;

  for (const [cat, items] of Object.entries(result)) {
    if (!items.length) continue;
    hasAny = true;
    const info = CAT_INFO[cat];
    html += `<div style="margin-bottom:0.9rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
        <span class="tag ${info.tag}">${info.label}</span>
        <button class="btn btn-ghost btn-sm" onclick="addAllSorted('${cat}',${JSON.stringify(items).replace(/'/g,"&#39;")})">Add All</button>
      </div>`;
    items.forEach((item, idx) => {
      html += `<div class="flex-between" style="background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;padding:0.35rem 0.65rem;margin-bottom:0.25rem;font-size:0.87rem;">
        <span>${esc(item)}</span>
        <button class="btn btn-ghost btn-sm" style="border-color:var(--accent2);color:var(--accent2);"
          onclick="addSortedItem('${cat}','${item.replace(/'/g,"&#39;")}',this)">+ Add</button>
      </div>`;
    });
    html += '</div>';
  }

  if (!hasAny) html += '<p style="color:var(--text-muted);font-size:0.85rem;">Nothing matched – try using prefixes like "NPC:", "Quest:", "Location:" etc.</p>';

  container.innerHTML = html;
  container.style.display = 'block';
}

function addSortedItem(cat, text, btn) {
  const listMap = { pcs:'pc-pills', npcs:'npc-pills', locations:'loc-pills', encounters:'enc-pills', loot:'loot-pills', plot:'plot-pills', notes:'note-pills' };
  if (cat === 'pcs') {
    S.prep.pcs.push({ name: text, classLevel:'', notes:'' });
    appendPill('pc-pills', text, 'pcs', S.prep.pcs.length - 1);
  } else if (cat === 'npcs') {
    S.prep.npcs.push({ name: text, role:'', notes:'' });
    appendPill('npc-pills', text, 'npcs', S.prep.npcs.length - 1);
  } else {
    S.prep[cat].push(text);
    appendPill(listMap[cat], text, cat, S.prep[cat].length - 1);
  }
  if (btn) { btn.textContent = '✓'; btn.disabled = true; btn.style.opacity = '0.5'; }
  showToast('Added to form!');
}

function addAllSorted(cat, items) {
  items.forEach(item => addSortedItem(cat, item, null));
  showToast(`Added ${items.length} items to form!`);
}

// ─────────────────────────────────────────────────────────────
//  DM SCREEN
// ─────────────────────────────────────────────────────────────
function renderDMSessionList() {
  const el = document.getElementById('dm-session-list');
  if (!S.sessions.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem;">No sessions saved.</p>';
    return;
  }
  const sections = [];

  S.campaigns.forEach(campaign => {
    const sessions = getCampaignSessions(campaign.id).slice().reverse();
    if (!sessions.length) return;
    sections.push(`
      <div style="margin-bottom:0.8rem;">
        <div style="font-family:var(--font-head);font-size:0.72rem;letter-spacing:0.08em;color:var(--gold);margin:0.2rem 0 0.45rem;">🏰 ${esc(campaign.name)}</div>
        ${sessions.map(s => `
          <button class="sidebar-link ${S.activeSession?.id === s.id ? 'active' : ''}"
                  onclick="selectDMSession(${s.id})">
            <strong style="display:block;font-size:0.85rem;">${esc(s.title)}</strong>
            <span style="font-size:0.72rem;color:var(--text-muted);">${formatDate(s.date)}</span>
          </button>
        `).join('')}
      </div>
    `);
  });

  const standalone = S.sessions.filter(s => !s.campaignId).sort(compareSessions).reverse();
  if (standalone.length) {
    sections.push(`
      <div>
        <div style="font-family:var(--font-head);font-size:0.72rem;letter-spacing:0.08em;color:var(--text-muted);margin:0.2rem 0 0.45rem;">🧭 Standalone</div>
        ${standalone.map(s => `
          <button class="sidebar-link ${S.activeSession?.id === s.id ? 'active' : ''}"
                  onclick="selectDMSession(${s.id})">
            <strong style="display:block;font-size:0.85rem;">${esc(s.title)}</strong>
            <span style="font-size:0.72rem;color:var(--text-muted);">${formatDate(s.date)}</span>
          </button>
        `).join('')}
      </div>
    `);
  }

  el.innerHTML = sections.join('');
}

function selectDMSession(id) {
  S.activeSession = S.sessions.find(s => s.id === id) || null;
  renderDMSessionList();
  renderDMContent();
}

function renderTrackedCategory(session, category, emptyText) {
  const items = session[category] || [];
  if (!items.length) return `<p style="color:var(--text-muted);font-size:0.85rem;">${emptyText}</p>`;

  return items.map((item, index) => {
    const carried = isCarriedItem(session, category, item);
    const done = isCompletedItem(session, category, item);
    const title = category === 'pcs'
      ? `${esc(item.name)}${item.classLevel ? ` <span class="tag" style="font-size:0.65rem;">${esc(item.classLevel)}</span>` : ''}`
      : category === 'npcs'
      ? `${esc(item.name)}${item.role ? ` <span class="tag blue" style="font-size:0.65rem;">${esc(item.role)}</span>` : ''}`
      : category === 'encounters'
      ? `${esc(item.name)}${item.cr ? ` <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.4rem;">[${esc(item.cr)}]</span>` : ''}`
      : esc(item);
    const detail = category === 'pcs'
      ? item.notes
      : category === 'npcs'
      ? item.notes
      : category === 'encounters'
      ? item.notes
      : '';

    return `
      <div class="tracked-item ${done ? 'is-done' : ''}">
        <div class="tracked-item-title">
          <div style="font-size:0.87rem;">${title}</div>
          <div style="display:flex;gap:0.25rem;flex-wrap:wrap;justify-content:flex-end;">
            ${carried ? '<span class="tag green">Carried Over</span>' : ''}
            ${done ? '<span class="tag">Done</span>' : ''}
          </div>
        </div>
        ${detail ? `<p style="font-size:0.8rem;color:var(--text-muted);">${esc(detail)}</p>` : ''}
        <div class="tracked-item-actions">
          ${carried ? `<button class="btn btn-outline btn-sm" onclick="toggleSessionItemProgress(${session.id},'${category}',${index})">${done ? 'Mark Active' : 'Mark Done'}</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderDMContent() {
  const el = document.getElementById('dm-content');
  const s  = S.activeSession;

  if (!s) {
    el.innerHTML = `<div class="card empty-state"><div class="empty-icon">🎲</div><p>No session selected</p><small>Pick one from the left.</small></div>`;
    return;
  }

  const sessionNumber = s.campaignId ? getCampaignSessions(s.campaignId).findIndex(cs => cs.id === s.id) + 1 : null;

  const pcHtml = renderTrackedCategory(s, 'pcs', 'None');
  const npcHtml = renderTrackedCategory(s, 'npcs', 'None');
  const locHtml = renderTrackedCategory(s, 'locations', 'None');
  const encHtml = renderTrackedCategory(s, 'encounters', 'None');
  const lootHtml = renderTrackedCategory(s, 'loot', 'None');
  const plotHtml = renderTrackedCategory(s, 'plot', 'None');
  const notesHtml = s.notes?.length
    ? `<div class="card" style="margin-top:1rem;"><div class="card-title">📝 Notes</div>${renderTrackedCategory(s, 'notes', 'None')}</div>`
    : '';

  el.innerHTML = `
    <div class="card" style="margin-bottom:1rem;padding:0.9rem 1.1rem;">
      <div class="flex-between" style="flex-wrap:wrap;gap:0.5rem;">
        <div>
          <h2 style="font-size:1.3rem;">${esc(s.title)}</h2>
          <p style="color:var(--text-muted);font-size:0.85rem;">${formatDate(s.date)}${s.setting ? ' · 📍 '+esc(s.setting) : ''}</p>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;justify-content:flex-end;">
          <span class="tag purple">🏰 ${esc(getSessionCampaignLabel(s))}</span>
          ${sessionNumber ? `<span class="tag">Session ${sessionNumber}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="grid-3" style="margin-bottom:1rem;">
      <div class="card"><div class="card-title">🛡 Player Characters</div>${pcHtml}</div>
      <div class="card blue"><div class="card-title">🧙 NPCs</div>${npcHtml}</div>
      <div class="card green"><div class="card-title">📍 Locations</div>${locHtml}</div>
    </div>
    <div class="grid-2" style="margin-bottom:1rem;">
      <div class="card purple"><div class="card-title">🎭 Plot Hooks</div>${plotHtml}</div>
      <div class="card red"><div class="card-title">⚔ Encounters</div>${encHtml}</div>
      <div class="card gold"><div class="card-title">💰 Loot</div>${lootHtml}</div>
    </div>
    ${notesHtml}
  `;
}

// ── INITIATIVE TRACKER ──────────────────────────────────────
function addInit() {
  const name = document.getElementById('init-name').value.trim();
  const roll = parseInt(document.getElementById('init-roll').value);
  const type = document.getElementById('init-type').value;
  if (!name || isNaN(roll)) { showToast('Enter a name and roll.'); return; }
  S.initiative.push({ name, roll, type });
  S.initiative.sort((a,b) => b.roll - a.roll);
  S.currentTurn = 0;
  document.getElementById('init-name').value = '';
  document.getElementById('init-roll').value = '';
  renderInit();
}

function renderInit() {
  const list = document.getElementById('init-list');
  if (!S.initiative.length) { list.innerHTML = ''; return; }
  const typeColor = { player:'var(--accent2)', enemy:'var(--accent)', ally:'var(--accent3)' };
  list.innerHTML = S.initiative.map((c,i) => `
    <li class="${i === S.currentTurn ? 'current' : ''}">
      <span class="init-num">${c.roll}</span>
      <span style="color:${typeColor[c.type]};font-size:0.75rem;">●</span>
      <span style="flex:1;">${esc(c.name)}</span>
      ${i === S.currentTurn ? '<span class="tag" style="font-size:0.6rem;">ACTIVE</span>' : ''}
      <button onclick="removeInit(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.85rem;" title="Remove">✕</button>
    </li>
  `).join('');
}

function nextTurn() {
  if (!S.initiative.length) return;
  S.currentTurn = (S.currentTurn + 1) % S.initiative.length;
  if (S.currentTurn === 0) {
    S.round++;
    document.getElementById('round-num').textContent = S.round;
    showToast(`⚔ Round ${S.round} begins!`);
  }
  renderInit();
}

function removeInit(idx) {
  S.initiative.splice(idx, 1);
  if (S.currentTurn >= S.initiative.length) S.currentTurn = 0;
  renderInit();
}

function resetInit() {
  if (!confirm('Reset initiative tracker?')) return;
  S.initiative = []; S.currentTurn = 0; S.round = 1;
  document.getElementById('round-num').textContent = '1';
  renderInit();
}

// ── HP TRACKER ──────────────────────────────────────────────
function addHP() {
  const name = document.getElementById('hp-name').value.trim();
  const max  = parseInt(document.getElementById('hp-max').value);
  if (!name || isNaN(max) || max <= 0) { showToast('Enter a name and max HP.'); return; }
  S.hpEntries.push({ name, current: max, max });
  document.getElementById('hp-name').value = '';
  document.getElementById('hp-max').value  = '';
  renderHP();
}

function renderHP() {
  const el = document.getElementById('hp-list');
  if (!S.hpEntries.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No one tracked yet.</p>';
    return;
  }
  el.innerHTML = S.hpEntries.map((e, i) => {
    const pct = Math.max(0, Math.round((e.current / e.max) * 100));
    const col = pct > 60 ? 'var(--accent2)' : pct > 30 ? 'var(--gold)' : 'var(--accent)';
    return `
      <div class="hp-row">
        <span style="min-width:90px;font-size:0.85rem;">${esc(e.name)}</span>
        <div class="hp-bar-wrap">
          <div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>
        <div class="hp-controls">
          <button onclick="adjustHP(${i},-1)">−</button>
          <input type="number" value="${e.current}" min="0" max="${e.max}"
                 onchange="setHP(${i},this.value)" style="width:46px;" />
          <button onclick="adjustHP(${i},1)">+</button>
          <span style="color:var(--text-muted);font-size:0.75rem;white-space:nowrap;">/${e.max}</span>
        </div>
        <button onclick="removeHP(${i})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.85rem;" title="Remove">✕</button>
      </div>`;
  }).join('');
}

function adjustHP(i, delta) {
  S.hpEntries[i].current = Math.max(0, Math.min(S.hpEntries[i].max, S.hpEntries[i].current + delta));
  renderHP();
}

function setHP(i, val) {
  S.hpEntries[i].current = Math.max(0, Math.min(S.hpEntries[i].max, parseInt(val) || 0));
  renderHP();
}

function removeHP(i) { S.hpEntries.splice(i, 1); renderHP(); }

// ─────────────────────────────────────────────────────────────
//  MONSTERS
// ─────────────────────────────────────────────────────────────
let openMonsterRow = null;

function renderMonsterTable() {
  filterMonsters();
}

function filterMonsters() {
  const search = (document.getElementById('monster-search')?.value || '').toLowerCase();
  const type   = document.getElementById('monster-type')?.value || '';
  const cr     = document.getElementById('monster-cr')?.value   || '';

  let list = MONSTERS.filter(m => {
    if (search && !m.name.toLowerCase().includes(search) && !m.type.toLowerCase().includes(search)) return false;
    if (type && m.type !== type) return false;
    if (cr   && m.cr  !== cr)   return false;
    return true;
  });

  // Apply sort
  const { key, dir } = S.monsterSort;
  list = list.sort((a,b) => {
    let av = a[key], bv = b[key];
    if (key === 'cr') { av = crToNum(av); bv = crToNum(bv); }
    if (typeof av === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  const tbody = document.getElementById('monster-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:1.5rem;">No monsters match your filters.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map((m, idx) => `
    <tr onclick="toggleMonsterDetail(${idx})" style="cursor:pointer;">
      <td><strong>${esc(m.name)}</strong></td>
      <td><span class="tag ${crToNum(m.cr) >= 10 ? 'red' : crToNum(m.cr) >= 5 ? '' : 'green'}">${m.cr}</span></td>
      <td style="color:var(--text-muted);">${m.type}</td>
      <td style="color:var(--text-muted);">${m.size}</td>
      <td>${m.hp}</td>
      <td>${m.ac}</td>
      <td>${m.speed}</td>
      <td><span style="color:var(--text-muted);font-size:0.8rem;">▶ Details</span></td>
    </tr>
    <tr id="mdetail-${idx}" style="display:none;">
      <td colspan="8">
        <div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;padding:0.8rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:0.6rem;font-size:0.83rem;">
          <div><strong style="font-family:var(--font-head);font-size:0.68rem;color:var(--text-muted);display:block;">ABILITY SCORES</strong>STR ${m.str} | DEX ${m.dex} | CON ${m.con}<br>INT ${m.int} | WIS ${m.wis} | CHA ${m.cha}</div>
          <div><strong style="font-family:var(--font-head);font-size:0.68rem;color:var(--text-muted);display:block;">ATTACKS</strong>${esc(m.attacks)}</div>
          <div><strong style="font-family:var(--font-head);font-size:0.68rem;color:var(--text-muted);display:block;">TRAITS</strong>${esc(m.traits)}</div>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleMonsterDetail(idx) {
  const row = document.getElementById(`mdetail-${idx}`);
  if (!row) return;
  const isOpen = row.style.display !== 'none';
  // Close all
  document.querySelectorAll('[id^="mdetail-"]').forEach(r => r.style.display = 'none');
  if (!isOpen) row.style.display = '';
}

function sortMonsters(key) {
  if (S.monsterSort.key === key) S.monsterSort.dir *= -1;
  else { S.monsterSort.key = key; S.monsterSort.dir = 1; }
  filterMonsters();
}

// ─────────────────────────────────────────────────────────────
//  FACTIONS
// ─────────────────────────────────────────────────────────────
function renderFactions() {
  const el = document.getElementById('faction-list');
  if (!S.factions.length) {
    el.innerHTML = `
      <div class="card empty-state" style="grid-column:1/-1;">
        <div class="empty-icon">⚜</div>
        <p>No factions yet</p>
        <small>Click <strong>+ New Faction</strong> to create one.</small>
      </div>`;
    return;
  }

  el.innerHTML = S.factions.map((f, i) => {
    const repPct = Math.max(0, Math.min(100, ((f.reputation + 100) / 200) * 100));
    const repColor = f.reputation >= 50 ? 'var(--accent2)' : f.reputation >= 0 ? 'var(--gold)' : 'var(--accent)';
    const repLabel = f.reputation >= 75 ? 'Revered' : f.reputation >= 50 ? 'Friendly' : f.reputation >= 25 ? 'Neutral' : f.reputation >= 0 ? 'Wary' : f.reputation >= -50 ? 'Hostile' : 'Enemy';

    return `
      <div class="faction-card">
        <div class="flex-between" style="margin-bottom:0.4rem;">
          <div class="faction-name">${esc(f.name)}</div>
          <div style="display:flex;gap:0.3rem;">
            <button class="btn btn-ghost btn-sm" onclick="editFaction(${i})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteFaction(${i})">Delete</button>
          </div>
        </div>
        ${f.alignment ? `<span class="tag">${esc(f.alignment)}</span>` : ''}
        ${f.leader    ? `<span class="tag blue">Leader: ${esc(f.leader)}</span>` : ''}
        ${f.location  ? `<span class="tag green">📍 ${esc(f.location)}</span>` : ''}
        <div style="margin:0.6rem 0;">
          <div class="flex-between" style="font-size:0.78rem;margin-bottom:0.2rem;">
            <span style="color:var(--text-muted);">Party Reputation</span>
            <span style="color:${repColor};font-family:var(--font-head);">${repLabel} (${f.reputation > 0 ? '+' : ''}${f.reputation})</span>
          </div>
          <div class="rep-bar"><div class="rep-fill" style="width:${repPct}%;background:${repColor};"></div></div>
        </div>
        ${f.description ? `<p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.4rem;">${esc(f.description)}</p>` : ''}
        ${f.notes ? `<p style="font-size:0.82rem;margin-top:0.4rem;border-top:1px solid var(--border);padding-top:0.4rem;">${esc(f.notes)}</p>` : ''}
        <div style="display:flex;gap:0.4rem;margin-top:0.7rem;flex-wrap:wrap;">
          <button class="btn btn-ghost btn-sm" onclick="adjustRep(${i}, 10)">+10 Rep</button>
          <button class="btn btn-ghost btn-sm" onclick="adjustRep(${i}, 25)">+25 Rep</button>
          <button class="btn btn-ghost btn-sm" onclick="adjustRep(${i}, -10)">-10 Rep</button>
          <button class="btn btn-ghost btn-sm" onclick="adjustRep(${i}, -25)">-25 Rep</button>
        </div>
      </div>`;
  }).join('');
}

function adjustRep(i, delta) {
  S.factions[i].reputation = Math.max(-100, Math.min(100, (S.factions[i].reputation || 0) + delta));
  saveFactionsToLS();
  renderFactions();
}

function openFactionModal(editIdx = null) {
  const f = editIdx !== null ? S.factions[editIdx] : null;
  const html = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-title">${f ? 'Edit Faction' : '⚜ New Faction'}</div>
        <div class="form-group"><label>Faction Name *</label><input type="text" id="f-name" value="${f ? esc(f.name) : ''}" placeholder="The Thieves' Guild" /></div>
        <div class="grid-2">
          <div class="form-group"><label>Leader / Head</label><input type="text" id="f-leader" value="${f ? esc(f.leader||'') : ''}" placeholder="Maren Ashvale" /></div>
          <div class="form-group"><label>Alignment</label>
            <select id="f-align">
              ${['','Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'].map(a => `<option ${f?.alignment===a?'selected':''}>${a}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Base Location</label><input type="text" id="f-location" value="${f ? esc(f.location||'') : ''}" placeholder="The Undercity of Valdris" /></div>
        <div class="form-group"><label>Starting Reputation (−100 to 100)</label><input type="number" id="f-rep" value="${f ? f.reputation : 0}" min="-100" max="100" /></div>
        <div class="form-group"><label>Description</label><textarea id="f-desc" placeholder="What does this faction want? Who are they?">${f ? esc(f.description||'') : ''}</textarea></div>
        <div class="form-group"><label>DM Notes</label><textarea id="f-notes" placeholder="Secret plans, known members, owed favours...">${f ? esc(f.notes||'') : ''}</textarea></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
          <button class="btn btn-gold" onclick="saveFaction(${editIdx})">💾 Save Faction</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modal-container').innerHTML = html;
}

function saveFaction(editIdx) {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Please enter a faction name.'); return; }
  const faction = {
    name,
    leader:      document.getElementById('f-leader').value.trim(),
    alignment:   document.getElementById('f-align').value,
    location:    document.getElementById('f-location').value.trim(),
    reputation:  parseInt(document.getElementById('f-rep').value) || 0,
    description: document.getElementById('f-desc').value.trim(),
    notes:       document.getElementById('f-notes').value.trim(),
  };
  if (editIdx !== null) S.factions[editIdx] = faction;
  else S.factions.push(faction);
  saveFactionsToLS();
  closeModal();
  renderFactions();
  showToast('✅ Faction saved!');
}

function editFaction(i)   { openFactionModal(i); }
function deleteFaction(i) {
  if (!confirm(`Delete faction "${S.factions[i].name}"?`)) return;
  S.factions.splice(i, 1);
  saveFactionsToLS();
  renderFactions();
  showToast('Faction deleted.');
}

function closeModal() { document.getElementById('modal-container').innerHTML = ''; }

// ─────────────────────────────────────────────────────────────
//  DICE ROLLER
// ─────────────────────────────────────────────────────────────
function setAdvantage(mode) {
  S.advantage = mode;
  ['normal','adv','dis'].forEach(m => {
    const btn = document.getElementById('adv-' + m);
    btn.className = 'btn btn-sm ' + (m === mode ? 'btn-outline' : 'btn-ghost');
  });
}

function rollDie(sides) {
  const mod    = parseInt(document.getElementById('dice-mod').value) || 0;
  const btn    = event.currentTarget;
  btn.classList.add('rolling');
  setTimeout(() => btn.classList.remove('rolling'), 550);

  let rolls, total, desc;

  if (sides === 20 && S.advantage !== 'normal') {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    const chosen = S.advantage === 'adv' ? Math.max(r1,r2) : Math.min(r1,r2);
    total = chosen + mod;
    desc  = `d20 (${r1}, ${r2}) → ${chosen}${mod ? (mod>0?'+':'')+mod : ''} = ${total} [${S.advantage}]`;
    rolls = [r1, r2];
  } else {
    const r = Math.floor(Math.random() * sides) + 1;
    total   = r + mod;
    desc    = `1d${sides} → ${r}${mod ? (mod>0?'+':'')+mod : ''} = ${total}`;
    rolls   = [r];
  }

  displayRollResult(total, desc, sides, rolls[0]);
}

function rollCustom() {
  const count = Math.max(1, Math.min(20, parseInt(document.getElementById('custom-count').value) || 1));
  const sides = Math.max(2, parseInt(document.getElementById('custom-sides').value) || 6);
  const mod   = parseInt(document.getElementById('dice-mod').value) || 0;

  const rolls = Array.from({length: count}, () => Math.floor(Math.random() * sides) + 1);
  const sum   = rolls.reduce((a,b) => a+b, 0) + mod;
  const desc  = `${count}d${sides} (${rolls.join(', ')})${mod ? (mod>0?'+':'')+mod : ''} = ${sum}`;

  displayRollResult(sum, desc, sides, rolls[0]);
}

function displayRollResult(total, desc, sides, firstRoll) {
  const display = document.getElementById('roll-display');
  const totalEl = document.getElementById('roll-total');
  const descEl  = document.getElementById('roll-desc');

  totalEl.textContent = total;
  descEl.textContent  = desc;
  display.style.display = 'block';

  // Colour nat 20 / nat 1 on d20
  if (sides === 20) {
    totalEl.style.color = firstRoll === 20 ? 'var(--gold-light)' : firstRoll === 1 ? 'var(--accent)' : 'var(--gold-light)';
    totalEl.style.textShadow = firstRoll === 20
      ? '0 0 30px rgba(212,168,67,0.8)'
      : firstRoll === 1
      ? '0 0 30px rgba(184,64,64,0.8)'
      : '0 0 30px rgba(212,168,67,0.4)';
    if (firstRoll === 20) showToast('🎉 Natural 20!');
    if (firstRoll === 1)  showToast('💀 Natural 1...');
  } else {
    totalEl.style.color      = 'var(--gold-light)';
    totalEl.style.textShadow = '0 0 30px rgba(212,168,67,0.4)';
  }

  // Force re-animation
  totalEl.style.animation = 'none';
  void totalEl.offsetWidth;
  totalEl.style.animation = '';

  // Add to history
  const now = new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
  S.rollHistory.unshift({ desc, time: now });
  if (S.rollHistory.length > 50) S.rollHistory.pop();
  saveRollsToLS();
  renderRollHistory();
}

function renderRollHistory() {
  const el = document.getElementById('roll-history');
  if (!S.rollHistory.length) {
    el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No rolls yet.</p>';
    return;
  }
  el.innerHTML = S.rollHistory.map(r => `
    <div class="roll-entry">
      <span>${esc(r.desc)}</span>
      <span style="color:var(--text-muted);font-size:0.78rem;white-space:nowrap;">${r.time}</span>
    </div>
  `).join('');
}

function clearRollHistory() {
  S.rollHistory = [];
  saveRollsToLS();
  renderRollHistory();
  document.getElementById('roll-display').style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
//  THEMES
// ─────────────────────────────────────────────────────────────
function applyTheme(id) {
  S.theme = id;
  document.documentElement.setAttribute('data-theme', id);
  saveThemeToLS();
}

function renderThemePage() {
  document.getElementById('account-name').textContent = `Logged in as: ${S.user.username}`;
  const grid = document.getElementById('theme-grid');
  grid.innerHTML = THEMES.map(t => `
    <div class="theme-card ${S.theme === t.id ? 'active' : ''}" onclick="selectTheme('${t.id}')">
      <div class="theme-preview" style="background:${t.preview};">
        <span style="font-family:'Cinzel',serif;font-size:1.1rem;color:${t.accent};text-shadow:0 0 10px rgba(0,0,0,0.5);">⚔ DM Forge</span>
      </div>
      <div class="theme-name" style="background:${t.bg};color:${t.accent};">${t.name}</div>
    </div>
  `).join('');
}

function selectTheme(id) {
  applyTheme(id);
  renderThemePage();
  showToast(`Theme changed to "${THEMES.find(t=>t.id===id)?.name || id}".`);
}

// ─────────────────────────────────────────────────────────────
//  INIT ON LOAD
// ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Check for existing login session
  const saved = lsGet('currentUser');
  if (saved?.username) {
    S.user = saved;
    launchApp();
  }

  // Default d20 advantage state
  setAdvantage('normal');

  // Set default prep date
  const dateEl = document.getElementById('p-date');
  if (dateEl) dateEl.valueAsDate = new Date();
  renderCampaignOptions();
  updateCarryForwardNotice();

  // Load roll history display
  renderRollHistory();
});

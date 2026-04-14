import React, { useState } from 'react';
import { ImagePlus, Upload, X, RefreshCw, Eye, Palette, Sliders, Type, ChevronLeft, ChevronRight } from 'lucide-react';
import { Settings } from '@/types';
import { GlassContainer } from '@/components/ui/GlassContainer';

interface CustomizeSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onExportData: () => void;
  onImportData: () => void;
  onForceSync: () => void;
}

// 100+ High Quality Unsplash Images
const GALLERY_IMAGES = [
  // Nature & Landscape (20)
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
  "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80", // Autumn Woods Fixed
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80",
  "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1200&q=80",
  "https://images.unsplash.com/photo-1506308026214-7158cd33832c?w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  "https://images.unsplash.com/photo-1500622764614-be3c1783fead?w=1200&q=80",
  "https://images.unsplash.com/photo-1433086566608-bc273bb42ea2?w=1200&q=80",
  "https://images.unsplash.com/photo-1510784722466-f2aa9c52fed6?w=1200&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80",

  // Abstract & Artsy (20)
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80", // Silk Fixed
  "https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=80",
  "https://images.unsplash.com/photo-1536566482680-fca31930a0bd?w=1200&q=80",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80",
  "https://images.unsplash.com/photo-1541450202152-4e89714878f8?w=1200&q=80", // Ink water Fixed
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1200&q=80", // Oil Canvas Fixed
  "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80",
  "https://images.unsplash.com/photo-1550537687-c91072c4792d?w=1200&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80",
  "https://images.unsplash.com/photo-1515405290399-ed3ee214a6d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1614728263952-84ea206f3140?w=1200&q=80", // Deep Orb Fixed
  "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=1200&q=80",
  "https://images.unsplash.com/photo-1506259091721-347e791bab0f?w=1200&q=80",
  "https://images.unsplash.com/photo-1604076913837-52ca5629fba9?w=1200&q=80",
  "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?w=1200&q=80",

  // Minimalist & Clean (20)
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
  "https://images.unsplash.com/photo-1518005020251-098c1860c911?w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=1200&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80",
  "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=1200&q=80",
  "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200&q=80",
  "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=1200&q=80",
  "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=1200&q=80",
  "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=1200&q=80",
  "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1200&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
  "https://images.unsplash.com/photo-1464802686167-b939a67e06d1?w=1200&q=80",

  // Architecture & Urban (20)
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80",
  "https://images.unsplash.com/photo-1428366284662-ad404f7192ea?w=1200&q=80",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80",
  "https://images.unsplash.com/photo-1514565131-0ce0801e678d?w=1200&q=80",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
  "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1200&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80",
  "https://images.unsplash.com/photo-1496568844517-86f2d7034164?w=1200&q=80",
  "https://images.unsplash.com/photo-1473163928189-3f40ddc74a04?w=1200&q=80",
  "https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=80",
  "https://images.unsplash.com/photo-1470219556762-17723cbd7a3d?w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bdb?w=1200&q=80",
  "https://images.unsplash.com/photo-1441260037375-9e6be2cd986a?w=1200&q=80",
  "https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&q=80",

  // Textures & Gradients (20)
  "https://images.unsplash.com/photo-1550147760-44c9966d6bc7?w=1200&q=80",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80",
  "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&q=80",
  "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=1200&q=80",
  "https://images.unsplash.com/photo-1541450805268-4822a3a774ca?w=1200&q=80",
  "https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=1200&q=80",
  "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=1200&q=80",
  "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80",
  "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=1200&q=80",
  "https://images.unsplash.com/photo-1554034483-04fda0d35af7?w=1200&q=80",
  "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=1200&q=80",
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80",
  "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=1200&q=80",
  "https://images.unsplash.com/photo-1614850523296-6ca7d46f5298?w=1200&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80",
  "https://images.unsplash.com/photo-1618272240728-26a9d9c51a9d?w=1200&q=80",
  "https://images.unsplash.com/photo-1615800501226-7bc3666f7d6e?w=1200&q=80",
  "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=1200&q=80",
  "https://images.unsplash.com/photo-1614850553991-67ca7fac0627?w=1200&q=80",
  "https://images.unsplash.com/photo-1614850553916-d8bb4f43c393?w=1200&q=80",
];

const GRADIENT_PRESETS = [
  { name: 'Warm Sunset', colors: ['#FF6B6B', '#FFD93D'], value: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)' },
  { name: 'Midnight', colors: ['#232526', '#414345'], value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Sea Foam', colors: ['#11998e', '#38ef7d'], value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Deep Space', colors: ['#0f0c29', '#24243e'], value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Royal Velvet', colors: ['#141e30', '#243b55'], value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { name: 'Rose', colors: ['#ff9a9e', '#fecfef'], value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Electric', colors: ['#6a11cb', '#2575fc'], value: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' },
  { name: 'Emerald', colors: ['#00b09b', '#96c93d'], value: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
  { name: 'Gold', colors: ['#f2994a', '#f2c94c'], value: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)' },
  { name: 'Silver', colors: ['#bdc3c7', '#2c3e50'], value: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
  { name: 'Berry', colors: ['#cc2b5e', '#753a88'], value: 'linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)' },
  { name: 'Mango', colors: ['#ffe259', '#ffa751'], value: 'linear-gradient(135deg, #ffe259 0%, #ffa751 100%)' },
  { name: 'Fire', colors: ['#f83600', '#f9d423'], value: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
  { name: 'Mint', colors: ['#43e97b', '#38f9d7'], value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Ocean', colors: ['#2193b0', '#6dd5ed'], value: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { name: 'Forest', colors: ['#134e4a', '#064e3b'], value: 'linear-gradient(135deg, #134e4a 0%, #064e3b 100%)' },
  { name: 'Lava', colors: ['#cb356b', '#bd3f32'], value: 'linear-gradient(135deg, #cb356b 0%, #bd3f32 100%)' },
  { name: 'Blue', colors: ['#00c6ff', '#0072ff'], value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { name: 'Purple', colors: ['#8e44ad', '#c0392b'], value: 'linear-gradient(135deg, #8e44ad 0%, #c0392b 100%)' },
  { name: 'Ice', colors: ['#e0eafc', '#cfdef3'], value: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' },
];

const SOLID_PRESETS = [
  // Beige & Muted Tones
  { name: 'Soft Beige', value: '#F5F5DC' }, { name: 'Warm Sand', value: '#E3E0D2' },
  { name: 'Oatmeal', value: '#EDEB D7' }, { name: 'Desert Taupe', value: '#B2AC88' },
  { name: 'Muted Sage', value: '#9A9A7A' }, { name: 'Warm Slate', value: '#708090' },
  { name: 'Dusty Rose', value: '#C08081' }, { name: 'Muted Teal', value: '#5F9EA0' },
  { name: 'Soft Mocha', value: '#6F4E37' }, { name: 'Cloud Gray', value: '#DCDCDC' },
  { name: 'Mist Blue', value: '#B0C4DE' }, { name: 'Pale Gold', value: '#EEE8AA' },
  { name: 'Silver Taupe', value: '#8B8589' }, { name: 'Muted Olive', value: '#556B2F' },
  { name: 'Deep Charcoal', value: '#36454F' }, { name: 'Ivory', value: '#FFFFF0' },
  { name: 'Linen', value: '#FAF0E6' }, { name: 'Antique White', value: '#FAEBD7' },
  { name: 'Seashell', value: '#FFF5EE' }, { name: 'Floral White', value: '#FFFAF0' },
];

const ITEMS_PER_PAGE = 12;

export function CustomizeSettings({ 
  settings, 
  setSettings, 
  onExportData, 
  onImportData,
  onForceSync
}: CustomizeSettingsProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [activeBgTab, setActiveBgTab] = useState<'image' | 'solid' | 'gradient'>(settings.backgroundType || 'image');
  
  // Custom Gradient Builder States
  const [gStart, setGStart] = useState('#4f46e5');
  const [gEnd, setGEnd] = useState('#9333ea');
  const [gAngle, setGAngle] = useState(135);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(GALLERY_IMAGES.length / ITEMS_PER_PAGE);
  const currentImages = GALLERY_IMAGES.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const applyCustomGradient = (start: string, end: string, angle: number) => {
    const value = `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
    setSettings((s) => ({ ...s, backgroundType: 'gradient', backgroundGradient: value }));
  };

  const handlePresetSelect = (url: string) => {
    setSettings((s) => ({ ...s, backgroundType: 'image', backgroundImage: url }));
  };

  const handleGradientSelect = (gradientValue: string, colors?: string[]) => {
    setSettings((s) => ({ ...s, backgroundType: 'gradient', backgroundGradient: gradientValue }));
    if (colors && colors[0] && colors[1]) {
      setGStart(colors[0]);
      setGEnd(colors[1]);
    }
  };

  const handleBackgroundTypeChange = (type: 'image' | 'solid' | 'gradient') => {
    setActiveBgTab(type);
    setSettings((s) => ({ ...s, backgroundType: type }));
  };

  const handleCustomUrlAdd = () => {
    if (customUrl.trim()) {
      setSettings((s) => ({ ...s, backgroundType: 'image', backgroundImage: customUrl.trim() }));
      setCustomUrl('');
      setIsAddingCustom(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings((s) => ({ ...s, backgroundType: 'image', backgroundImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setSettings((s) => ({ ...s, backgroundImage: '', backgroundType: 'image' }));
  };

  const handleOpacityChange = (value: number) => {
    setSettings((s) => ({ ...s, backgroundOpacity: value }));
  };

  const handleBlurChange = (value: number) => {
    setSettings((s) => ({ ...s, backgroundBlur: value }));
  };

  const handleCardOpacityChange = (value: number) => {
    setSettings((s) => ({ ...s, cardOpacity: value }));
  };

  const handleTextBrightnessChange = (value: number) => {
    setSettings((s) => ({ ...s, textBrightness: value }));
  };

  const handleTextColorChange = (value: string) => {
    setSettings((s) => ({ ...s, textColor: value }));
  };

  const handleBackgroundColorChange = (value: string) => {
    setSettings((s) => ({ ...s, backgroundColor: value, backgroundType: 'solid' }));
  };

  const handleCardBlurChange = (value: number) => {
    setSettings((s) => ({ ...s, cardBlur: value }));
  };

  const handleCardBackgroundColorChange = (value: string) => {
    setSettings((s) => ({ ...s, cardBackgroundColor: value }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-text-primary tracking-tight flex items-center gap-3">
          <Palette className="text-accent" size={32} />
          Customize
        </h2>
        <p className="text-text-secondary font-medium mt-2">
          Personalize your workspace appearance
        </p>
      </div>

      {/* Sync & Backup Section */}
      <GlassContainer className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw size={24} className="text-accent animate-spin-slow" />
            <div>
              <h3 className="text-xl font-bold text-text-primary">Sync & Backup</h3>
              <p className="text-sm text-text-secondary font-medium">Export or import your data manually if sync is slow</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Chrome Sync Ready
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onExportData}
            className="flex items-center gap-4 p-5 rounded-2xl bg-bg-card border border-border-card hover:border-accent hover:bg-accent/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-accent rotate-180" />
            </div>
            <div>
              <div className="font-bold text-text-primary group-hover:text-accent transition-colors">Export All Data</div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Save settings, notes & reminders as a file</div>
            </div>
          </button>

          <button
            onClick={onImportData}
            className="flex items-center gap-4 p-5 rounded-2xl bg-bg-card border border-border-card hover:border-accent hover:bg-accent/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-accent" />
            </div>
            <div>
              <div className="font-bold text-text-primary group-hover:text-accent transition-colors">Import Data</div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Restore data from a backup file</div>
            </div>
          </button>
        </div>

        <div className="pt-2">
            <button
                onClick={onForceSync}
                className="w-full py-4 rounded-xl border-2 border-dashed border-border-card hover:border-accent/40 hover:bg-accent/5 flex items-center justify-center gap-3 transition-all group"
            >
                <RefreshCw size={18} className="text-text-secondary group-hover:text-accent group-hover:rotate-180 transition-all duration-700" />
                <span className="text-sm font-bold text-text-secondary group-hover:text-accent">Force Metadata Repair & Push to Sync</span>
            </button>
            <p className="text-[10px] text-text-secondary text-center mt-3 font-medium opacity-60">
                Tip: If your notes aren't appearing on another PC, click "Force Metadata Repair" to re-encode all data into your bookmarks.
            </p>
        </div>
      </GlassContainer>

      {/* Current Background Preview */}
      {(settings.backgroundImage || settings.backgroundType === 'gradient' || settings.backgroundType === 'solid') && (
        <GlassContainer className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Eye size={20} className="text-accent" />
              Current Background
            </h3>
            <button
              onClick={handleRemoveBackground}
              className="px-4 py-2 rounded-xl bg-danger/10 text-danger font-semibold text-sm hover:bg-danger/20 transition-all flex items-center gap-2"
            >
              <X size={16} />
              Remove
            </button>
          </div>
          <div className="relative h-48 rounded-2xl overflow-hidden border border-border-card bg-bg-card/50 flex items-center justify-center">
            {settings.backgroundType === 'image' ? (
              settings.backgroundImage === 'LOCAL_UPLOAD' ? (
                <div className="text-center p-6">
                  <Upload size={40} className="mx-auto mb-3 text-text-secondary opacity-20" />
                  <p className="text-sm font-bold text-text-secondary">Image stored on another device</p>
                  <p className="text-[10px] text-text-secondary mt-1">Upload a new image or choose a preset to sync</p>
                </div>
              ) : (
                <img
                  src={settings.backgroundImage}
                  alt="Current background"
                  className="w-full h-full object-cover"
                  style={{
                    opacity: (settings.backgroundOpacity || 50) / 100,
                    filter: `blur(${settings.backgroundBlur || 0}px)`,
                  }}
                />
              )
            ) : settings.backgroundType === 'gradient' ? (
              <div 
                className="w-full h-full" 
                style={{ 
                  background: settings.backgroundGradient,
                  opacity: (settings.backgroundOpacity || 100) / 100 
                }} 
              />
            ) : (
              <div 
                className="w-full h-full" 
                style={{ 
                  backgroundColor: settings.backgroundColor,
                  opacity: (settings.backgroundOpacity || 100) / 100 
                }} 
              />
            )}
          </div>
        </GlassContainer>
      )}

      {/* Background Mode Selection Tabs */}
      <GlassContainer className="p-1.5 flex gap-1 rounded-2xl overflow-hidden">
          {(['image', 'solid', 'gradient'] as const).map((type) => (
              <button
                  key={type}
                  onClick={() => handleBackgroundTypeChange(type)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeBgTab === type 
                          ? 'bg-accent text-white shadow-lg' 
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
              >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Choice
              </button>
          ))}
      </GlassContainer>

      {/* Main Selection Area */}
      <GlassContainer className="p-6 space-y-8 min-h-[400px]">
          
          {activeBgTab === 'image' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-8 h-[1px] bg-white/10" />
                          Global Gallery (100+ Premium Images)
                      </label>
                      <div className="flex items-center gap-2">
                          <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-accent/10 hover:text-accent transition-all"
                          >
                             <ChevronLeft size={16} />
                          </button>
                          <span className="text-[10px] font-bold text-text-secondary">Page {currentPage} of {totalPages}</span>
                          <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 disabled:opacity-20 hover:bg-accent/10 hover:text-accent transition-all"
                          >
                             <ChevronRight size={16} />
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {currentImages.map((url, idx) => (
                          <button
                              key={url + idx}
                              onClick={() => handlePresetSelect(url)}
                              className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                                  settings.backgroundImage === url && settings.backgroundType === 'image'
                                      ? 'border-accent shadow-lg scale-105 z-10'
                                      : 'border-white/5 hover:border-accent/40'
                              }`}
                          >
                              <img src={url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                      ))}
                  </div>

                  {/* Upload Section */}
                  <div className="pt-8 border-t border-white/5">
                      <h4 className="text-sm font-bold text-text-primary mb-4">Custom Uploads</h4>
                      <div className="flex gap-4">
                          <label className="flex-1 cursor-pointer group">
                              <div className="p-8 rounded-2xl border-2 border-dashed border-border-card group-hover:border-accent/40 bg-white/5 group-hover:bg-accent/5 transition-all text-center">
                                  <Upload size={24} className="mx-auto mb-2 text-accent" />
                                  <p className="text-sm font-bold text-text-primary">Upload Local File</p>
                              </div>
                              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                          <div className="flex-1">
                              {!isAddingCustom ? (
                                  <button onClick={() => setIsAddingCustom(true)} className="w-full h-full p-8 rounded-2xl border-2 border-dashed border-border-card hover:border-accent/40 bg-white/5 hover:bg-accent/5 transition-all">
                                      <ImagePlus size={24} className="mx-auto mb-2 text-accent" />
                                      <p className="text-sm font-bold text-text-primary">Image from URL</p>
                                  </button>
                              ) : (
                                  <div className="h-full flex flex-col items-center justify-center gap-4 p-4 rounded-2xl border border-border-card bg-bg-card/50">
                                      <input
                                          type="text"
                                          placeholder="https://example.com/image.jpg"
                                          value={customUrl}
                                          onChange={(e) => setCustomUrl(e.target.value)}
                                          className="w-full px-4 py-3 rounded-xl bg-bg border border-border-card text-text-primary text-xs outline-none focus:border-accent"
                                      />
                                      <div className="flex gap-2 w-full">
                                          <button onClick={handleCustomUrlAdd} className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm">Apply Image</button>
                                          <button onClick={() => setIsAddingCustom(false)} className="px-4 py-3 rounded-xl border border-border-card text-text-secondary text-sm">Cancel</button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeBgTab === 'solid' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="space-y-4">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-8 h-[1px] bg-white/10" />
                          Beige & Sophisticated Solids
                      </label>
                      <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                          {SOLID_PRESETS.map((preset) => (
                              <button
                                  key={preset.value + preset.name}
                                  onClick={() => handleBackgroundColorChange(preset.value)}
                                  className={`aspect-square rounded-lg border-2 transition-all ${
                                      settings.backgroundColor === preset.value && settings.backgroundType === 'solid'
                                          ? 'border-accent shadow-md scale-110'
                                          : 'border-white/5 hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: preset.value }}
                                  title={preset.name}
                              />
                          ))}
                      </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">Custom Solid Color</h4>
                        <p className="text-xs text-text-secondary">Pick any specific color you desire</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-xl font-black text-accent">{settings.backgroundColor?.toUpperCase() || '#1A1C23'}</span>
                        <input
                            type="color"
                            value={settings.backgroundColor || '#1a1c23'}
                            onChange={(e) => handleBackgroundColorChange(e.target.value)}
                            className="w-12 h-12 rounded-2xl cursor-pointer bg-transparent border-none"
                        />
                      </div>
                  </div>
              </div>
          )}

          {activeBgTab === 'gradient' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  {/* Custom Builder */}
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-8">
                      <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Palette className="text-accent" size={20} />
                        Custom Gradient Builder
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-text-secondary uppercase">Start Color</label>
                              <div className="flex items-center gap-4">
                                  <input type="color" value={gStart} onChange={(e) => { setGStart(e.target.value); applyCustomGradient(e.target.value, gEnd, gAngle); }} className="w-12 h-12 rounded-xl bg-transparent cursor-pointer" />
                                  <span className="font-mono text-sm text-text-primary font-bold">{gStart.toUpperCase()}</span>
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-text-secondary uppercase">End Color</label>
                              <div className="flex items-center gap-4">
                                  <input type="color" value={gEnd} onChange={(e) => { setGEnd(e.target.value); applyCustomGradient(gStart, e.target.value, gAngle); }} className="w-12 h-12 rounded-xl bg-transparent cursor-pointer" />
                                  <span className="font-mono text-sm text-text-primary font-bold">{gEnd.toUpperCase()}</span>
                              </div>
                          </div>
                          <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-text-secondary uppercase">Angle</label>
                                <span className="text-sm font-black text-accent">{gAngle}°</span>
                              </div>
                              <input type="range" min="0" max="360" value={gAngle} onChange={(e) => { setGAngle(Number(e.target.value)); applyCustomGradient(gStart, gEnd, Number(e.target.value)); }} className="slider-accent" />
                          </div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                          <span className="w-8 h-[1px] bg-white/10" />
                          Premade Gradient Collection
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {GRADIENT_PRESETS.map((preset) => (
                              <button
                                  key={preset.value + preset.name}
                                  onClick={() => handleGradientSelect(preset.value, preset.colors)}
                                  className={`aspect-video rounded-2xl border-2 transition-all group relative overflow-hidden ${
                                      settings.backgroundGradient === preset.value && settings.backgroundType === 'gradient'
                                          ? 'border-accent shadow-lg scale-105 z-10'
                                          : 'border-white/5 hover:scale-105'
                                  }`}
                                  style={{ background: preset.value }}
                              >
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                      <span className="text-[10px] font-bold text-white px-2 py-1 bg-black/40 rounded-full mb-1">{preset.name}</span>
                                      <span className="text-[8px] text-white/60">Click to Tweak</span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}
      </GlassContainer>

      {/* Legacy Adjustments Sections Below */}
      
      {/* Background Refinement */}
      <GlassContainer className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Palette size={20} className="text-accent" />
            Background Fine-tuning
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold ">Visibility (Opacity)</h2>
                <span className="text-sm font-bold text-accent">{settings.backgroundOpacity || 50}%</span>
              </div>
              <input type="range" min="0" max="100" value={settings.backgroundOpacity || 50} onChange={(e) => handleOpacityChange(Number(e.target.value))} className="slider-accent" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Blur Intensity</h2>
                <span className="text-sm font-bold text-accent">{settings.backgroundBlur || 0}px</span>
              </div>
              <input type="range" min="0" max="25" value={settings.backgroundBlur || 0} onChange={(e) => handleBlurChange(Number(e.target.value))} className="slider-accent" />
            </div>
        </div>
      </GlassContainer>

      {/* Interface Adjustments */}
      <GlassContainer className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sliders size={20} className="text-accent" />
            Card Appearance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Card Opacity</h2>
                <span className="text-sm font-bold text-accent">{settings.cardOpacity || 60}%</span>
              </div>
              <input type="range" min="10" max="100" value={settings.cardOpacity || 60} onChange={(e) => handleCardOpacityChange(Number(e.target.value))} className="slider-accent" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Card Blur</h2>
                <span className="text-sm font-bold text-accent">{settings.cardBlur ?? 16}px</span>
              </div>
              <input type="range" min="0" max="40" value={settings.cardBlur ?? 16} onChange={(e) => handleCardBlurChange(Number(e.target.value))} className="slider-accent" />
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Card Accent Color</h2>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.cardBackgroundColor || '#1e293b'}
                  onChange={(e) => handleCardBackgroundColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-bg-card border border-border-card cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-text-primary uppercase">{settings.cardBackgroundColor || '#1e293b'}</span>
                    <button onClick={() => handleCardBackgroundColorChange('#1e293b')} className="text-[10px] text-accent font-bold hover:underline text-left mt-1">Reset</button>
                </div>
              </div>
            </div>
        </div>
      </GlassContainer>

      {/* Typography & Colors */}
      <GlassContainer className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Type size={20} className="text-accent" />
            Typography & Text Colors
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Text Brightness</h2>
                <span className="text-sm font-bold text-accent">{settings.textBrightness || 100}%</span>
              </div>
              <input type="range" min="50" max="150" value={settings.textBrightness || 100} onChange={(e) => handleTextBrightnessChange(Number(e.target.value))} className="slider-accent" />
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold">Primary Text Color</h2>
              <div className="flex items-center gap-4 text-text-primary">
                <input
                  type="color"
                  value={settings.textColor || '#e2e8f0'}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-bg-card border border-border-card cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold uppercase">{settings.textColor || '#e2e8f0'}</span>
                    <button onClick={() => handleTextColorChange('#e2e8f0')} className="text-[10px] text-accent font-bold hover:underline text-left mt-1">Reset</button>
                </div>
              </div>
            </div>
        </div>
      </GlassContainer>
    </div>
  );
}


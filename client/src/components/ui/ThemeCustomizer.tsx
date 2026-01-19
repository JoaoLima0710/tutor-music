import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Palette,
  Layout,
  Settings,
  Eye,
  Accessibility,
  Save,
  RotateCcw,
  Download,
  Upload,
  Loader2
} from 'lucide-react';
import {
  themeCustomizationService,
  LayoutPreset,
  UserPreferences,
  ThemeColors
} from '@/services/ThemeCustomizationService';
import { toast } from 'sonner';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [layouts, setLayouts] = useState<LayoutPreset[]>([]);
  const [colorPalettes, setColorPalettes] = useState<Record<string, ThemeColors>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      // Usar setTimeout para não bloquear a UI no tablet
      setTimeout(() => {
        const prefs = themeCustomizationService.getUserPreferences();
        const layoutsData = themeCustomizationService.getAvailableLayouts();
        const palettes = themeCustomizationService.getAvailableColorPalettes();
        
        setPreferences(prefs);
        setLayouts(layoutsData);
        setColorPalettes(palettes);
        setHasUnsavedChanges(false);
        setIsLoading(false);
      }, 50);
    } catch (error) {
      console.error('Erro ao carregar dados do tema:', error);
      toast.error('Erro ao carregar configurações de tema');
      setIsLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!preferences) return;
    
    setIsSaving(true);
    try {
      // Aplicar tema imediatamente
      themeCustomizationService.saveUserPreferences(preferences);
      
      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setHasUnsavedChanges(false);
      toast.success('Tema salvo com sucesso! 🎨', {
        description: 'Suas preferências foram aplicadas'
      });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast.error('Erro ao salvar tema', {
        description: 'Tente novamente'
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  const handleReset = () => {
    const defaultPrefs = {
      ...themeCustomizationService.getUserPreferences(),
      theme: {
        mode: 'dark' as const,
        colors: themeCustomizationService.getAvailableColorPalettes().ocean,
        borderRadius: 'md' as const,
        fontSize: 'md' as const,
        spacing: 'comfortable' as const,
        animations: 'full' as const
      },
      layout: themeCustomizationService.getAvailableLayouts()[0]
    };
    setPreferences(defaultPrefs);
    setHasUnsavedChanges(true);
  };

  const handleExport = () => {
    if (preferences) {
      const data = themeCustomizationService.exportPreferences();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'musictutor-theme-preferences.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (themeCustomizationService.importPreferences(content)) {
          loadData();
        } else {
          alert('Erro ao importar configurações. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  const updatePreference = useCallback((path: string, value: any) => {
    if (!preferences) return;

    const newPreferences = { ...preferences };
    const keys = path.split('.');
    let current: any = newPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setPreferences(newPreferences);
    setHasUnsavedChanges(true);
    
    // Aplicar mudanças de tema imediatamente (preview)
    if (path.startsWith('theme.')) {
      themeCustomizationService.applyTheme(newPreferences.theme);
    }
  }, [preferences]);

  // Memoizar paletas para melhor performance
  const paletteEntries = useMemo(() => {
    return Object.entries(colorPalettes);
  }, [colorPalettes]);

  if (!isOpen) return null;

  if (isLoading || !preferences) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-[#0f0f1a] rounded-2xl p-8 border border-white/20">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-center">Carregando personalização...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f1a] border-l border-white/20 shadow-2xl overflow-y-auto overscroll-contain">
        <div className="sticky top-0 bg-[#0f0f1a]/95 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Personalizar Tema</h2>
                <p className="text-sm text-gray-400">Customize sua experiência</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>

          {/* Save/Reset Bar */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="w-4 h-4 mr-1" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="w-4 h-4 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="navigation" className="text-xs">
                <Settings className="w-4 h-4 mr-1" />
                Navegação
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="text-xs">
                <Accessibility className="w-4 h-4 mr-1" />
                Acessibilidade
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Paletas de Cores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {paletteEntries.map(([name, colors]) => {
                      const isSelected = JSON.stringify(preferences.theme.colors) === JSON.stringify(colors);
                      return (
                        <Button
                          key={name}
                          onClick={() => {
                            // Aplicar imediatamente para preview
                            updatePreference('theme.colors', colors);
                            // Também atualizar via service para garantir consistência
                            try {
                              themeCustomizationService.updateColorPalette(name);
                            } catch (error) {
                              console.warn('Erro ao atualizar paleta via service:', error);
                            }
                            toast.success(`Paleta ${name} aplicada!`, { duration: 1500 });
                          }}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto p-3 flex flex-col items-center gap-2 transition-all ${
                            isSelected ? 'ring-2 ring-purple-500' : ''
                          }`}
                        >
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: colors.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: colors.secondary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: colors.accent }}
                            />
                          </div>
                          <span className="text-xs capitalize font-medium">{name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Configurações Visuais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Modo do Tema</label>
                    <div className="flex gap-2">
                      {(['light', 'dark', 'auto'] as const).map((mode) => (
                        <Button
                          key={mode}
                          onClick={() => updatePreference('theme.mode', mode)}
                          variant={preferences.theme.mode === mode ? "default" : "outline"}
                          size="sm"
                          className="capitalize"
                        >
                          {mode === 'auto' ? 'Automático' : mode === 'light' ? 'Claro' : 'Escuro'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Raio das Bordas</label>
                    <div className="flex gap-2">
                      {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
                        <Button
                          key={radius}
                          onClick={() => updatePreference('theme.borderRadius', radius)}
                          variant={preferences.theme.borderRadius === radius ? "default" : "outline"}
                          size="sm"
                          className="capitalize"
                        >
                          {radius === 'none' ? 'Reto' : radius}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Tamanho da Fonte</label>
                    <div className="flex gap-2">
                      {(['sm', 'md', 'lg'] as const).map((size) => (
                        <Button
                          key={size}
                          onClick={() => updatePreference('theme.fontSize', size)}
                          variant={preferences.theme.fontSize === size ? "default" : "outline"}
                          size="sm"
                          className="capitalize"
                        >
                          {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Médio' : 'Grande'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Espaçamento</label>
                    <div className="flex gap-2">
                      {(['compact', 'comfortable', 'spacious'] as const).map((spacing) => (
                        <Button
                          key={spacing}
                          onClick={() => updatePreference('theme.spacing', spacing)}
                          variant={preferences.theme.spacing === spacing ? "default" : "outline"}
                          size="sm"
                          className="capitalize"
                        >
                          {spacing === 'compact' ? 'Compacto' : spacing === 'comfortable' ? 'Confortável' : 'Espaçoso'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Animações</label>
                    <div className="flex gap-2">
                      {(['none', 'minimal', 'full'] as const).map((animation) => (
                        <Button
                          key={animation}
                          onClick={() => updatePreference('theme.animations', animation)}
                          variant={preferences.theme.animations === animation ? "default" : "outline"}
                          size="sm"
                          className="capitalize"
                        >
                          {animation === 'none' ? 'Nenhuma' : animation === 'minimal' ? 'Mínima' : 'Completa'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Estilos de Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {layouts.map((layout) => (
                      <Card
                        key={layout.id}
                        className={`cursor-pointer transition-all ${
                          preferences.layout.id === layout.id
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => {
                          themeCustomizationService.updateLayout(layout.id);
                          updatePreference('layout', layout);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{layout.icon}</span>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{layout.name}</h3>
                              <p className="text-sm text-gray-400 mb-2">{layout.description}</p>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {layout.dashboardLayout}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {layout.navigationStyle}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {layout.cardStyle}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Widgets do Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showStats', label: 'Estatísticas', description: 'XP, nível e progresso' },
                    { key: 'showRecent', label: 'Atividades Recentes', description: 'Últimas sessões de prática' },
                    { key: 'showAchievements', label: 'Conquistas', description: 'Badges e conquistas desbloqueadas' },
                    { key: 'showGoals', label: 'Metas', description: 'Objetivos diários e semanais' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{label}</p>
                        <p className="text-sm text-gray-400">{description}</p>
                      </div>
                      <Switch
                        checked={preferences.dashboard[key as keyof typeof preferences.dashboard] as boolean}
                        onCheckedChange={(checked) => updatePreference(`dashboard.${key}`, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Modo Compacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Interface Compacta</p>
                      <p className="text-sm text-gray-400">Reduz espaçamentos e elementos visuais</p>
                    </div>
                    <Switch
                      checked={preferences.dashboard.compactMode}
                      onCheckedChange={(checked) => {
                        themeCustomizationService.toggleCompactMode(checked);
                        updatePreference('dashboard.compactMode', checked);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Navigation Tab */}
            <TabsContent value="navigation" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Navegação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Navegação por Gestos</p>
                      <p className="text-sm text-gray-400">Swipe para navegar entre telas</p>
                    </div>
                    <Switch
                      checked={preferences.navigation.gestureNavigation}
                      onCheckedChange={(checked) => {
                        themeCustomizationService.setupGestureNavigation(checked);
                        updatePreference('navigation.gestureNavigation', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Feedback Háptico</p>
                      <p className="text-sm text-gray-400">Vibração em interações</p>
                    </div>
                    <Switch
                      checked={preferences.navigation.hapticFeedback}
                      onCheckedChange={(checked) => updatePreference('navigation.hapticFeedback', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Ocultar Navegação</p>
                      <p className="text-sm text-gray-400">Esconder automaticamente quando rolar</p>
                    </div>
                    <Switch
                      checked={preferences.navigation.autoHideNavigation}
                      onCheckedChange={(checked) => updatePreference('navigation.autoHideNavigation', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Acessibilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Alto Contraste</p>
                      <p className="text-sm text-gray-400">Cores com maior contraste</p>
                    </div>
                    <Switch
                      checked={preferences.accessibility.highContrast}
                      onCheckedChange={(checked) => {
                        themeCustomizationService.toggleHighContrast(checked);
                        updatePreference('accessibility.highContrast', checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Texto Grande</p>
                      <p className="text-sm text-gray-400">Fonte maior para melhor legibilidade</p>
                    </div>
                    <Switch
                      checked={preferences.accessibility.largeText}
                      onCheckedChange={(checked) => updatePreference('accessibility.largeText', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Reduzir Movimento</p>
                      <p className="text-sm text-gray-400">Minimizar animações e transições</p>
                    </div>
                    <Switch
                      checked={preferences.accessibility.reduceMotion}
                      onCheckedChange={(checked) => updatePreference('accessibility.reduceMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Leitor de Tela</p>
                      <p className="text-sm text-gray-400">Otimização para tecnologias assistivas</p>
                    </div>
                    <Switch
                      checked={preferences.accessibility.screenReader}
                      onCheckedChange={(checked) => updatePreference('accessibility.screenReader', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

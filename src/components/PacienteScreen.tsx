import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Calendar as CalendarIcon, Pill, AlertCircle, Clock, Bell, CheckCircle2, Plus, ChevronRight } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { supabase } from '../supabaseClient';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  date: string;
}

interface SideEffect {
  id: string;
  date: string;
  medication: string;
  effect: string;
  severity: 'leve' | 'moderado' | 'grave';
  location: 'hospitalar' | 'domiciliar';
}

interface Procedure {
  id: string;
  date: string;
  name: string;
  preparation: string;
  daysUntil: number;
}

export function PacienteScreen() {
  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
  const daqui3dias = new Date(hoje); daqui3dias.setDate(hoje.getDate() + 3);
  const daqui8dias = new Date(hoje); daqui8dias.setDate(hoje.getDate() + 8);
  const daqui15dias = new Date(hoje); daqui15dias.setDate(hoje.getDate() + 15);

  const formatData = (data: Date) => data.toISOString().split('T')[0];

  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Ondansetrona', dosage: '8mg', time: '08:00', taken: true, date: formatData(hoje) },
    { id: '2', name: 'Ondansetrona', dosage: '8mg', time: '16:00', taken: false, date: formatData(hoje) },
    { id: '3', name: 'Dexametasona', dosage: '4mg', time: '08:00', taken: true, date: formatData(hoje) },
    { id: '4', name: 'Dexametasona', dosage: '4mg', time: '20:00', taken: false, date: formatData(hoje) },
  ]);

  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);

  useEffect(() => {
    fetchSideEffects();
  }, []);

  const fetchSideEffects = async () => {
    const { data, error } = await supabase
      .from('side_effects')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.log('Erro ao buscar:', error);
    if (data) setSideEffects(data);
  };

  const [procedures, setProcedures] = useState<Procedure[]>([
    { 
      id: '1', 
      date: formatData(daqui3dias), 
      name: 'Tomografia de Tórax', 
      preparation: 'Jejum de 4 horas. Não suspender medicações de uso contínuo.', 
      daysUntil: 3 
    },
    { 
      id: '2', 
      date: formatData(daqui8dias), 
      name: 'Consulta Oncologista', 
      preparation: 'Levar exames anteriores e lista de medicamentos.', 
      daysUntil: 8 
    },
    { 
      id: '3', 
      date: formatData(daqui15dias), 
      name: 'Sessão de Quimioterapia', 
      preparation: 'Alimentação leve. Hidratação adequada. Chegar 30 min antes.', 
      daysUntil: 15 
    },
  ]);

  const [newSideEffect, setNewSideEffect] = useState<Partial<SideEffect>>({
    medication: '',
    effect: '',
    severity: 'leve',
    location: 'domiciliar'
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const addSideEffect = async () => {
    if (newSideEffect.medication && newSideEffect.effect) {
      const { error } = await supabase
        .from('side_effects')
        .insert([
          {
            date: new Date().toISOString().split('T')[0],
            medication: newSideEffect.medication || '',
            effect: newSideEffect.effect || '',
            severity: newSideEffect.severity || 'leve',
            location: newSideEffect.location || 'domiciliar'
          }
        ]);

      if (error) {
        alert('Erro ao salvar!');
        console.log(error);
      } else {
        fetchSideEffects();
        setNewSideEffect({
          medication: '',
          effect: '',
          severity: 'leve',
          location: 'domiciliar'
        });
        alert('Efeito colateral registrado!');
      }
    }
  };

  const upcomingProcedures = procedures.filter(p => p.daysUntil <= 7);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel do Paciente</CardTitle>
          <CardDescription>Acompanhe suas medicações, registre sintomas e veja sua agenda</CardDescription>
        </CardHeader>
      </Card>

      {upcomingProcedures.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <Bell className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Procedimentos Próximos</AlertTitle>
          <AlertDescription className="text-amber-800">
            Você tem {upcomingProcedures.length} procedimento(s) agendado(s) para os próximos 7 dias.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="medicacao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medicacao">Medicação</TabsTrigger>
          <TabsTrigger value="efeitos">Efeitos Colaterais</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="medicacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicações de Hoje</CardTitle>
              <CardDescription>Registre as medicações conforme você as toma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medications.map((med) => (
                  <div 
                    key={med.id} 
                    className={`border rounded-lg p-4 transition-all ${med.taken ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${med.taken ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {med.taken ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Pill className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-blue-900">{med.name}</p>
                          <p className="text-gray-600 text-sm">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm">{med.time}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={med.taken ? "outline" : "default"}
                          onClick={() => toggleMedication(med.id)}
                        >
                          {med.taken ? 'Desmarcar' : 'Tomei'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Adesão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl text-green-600">
                    {medications.filter(m => m.taken).length}
                  </div>
                  <p className="text-sm text-gray-600">Medicações tomadas</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl text-blue-600">
                    {medications.filter(m => !m.taken).length}
                  </div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efeitos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Efeito Colateral</CardTitle>
              <CardDescription>Informe qualquer reação ou sintoma que você esteja sentindo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicamento/Tratamento</Label>
                  <Input 
                    placeholder="Ex: Ondansetrona, Quimioterapia..."
                    value={newSideEffect.medication}
                    onChange={(e) => setNewSideEffect({...newSideEffect, medication: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gravidade</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newSideEffect.severity}
                    onChange={(e) => setNewSideEffect({...newSideEffect, severity: e.target.value as any})}
                  >
                    <option value="leve">Leve</option>
                    <option value="moderado">Moderado</option>
                    <option value="grave">Grave</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="location" 
                      value="domiciliar"
                      checked={newSideEffect.location === 'domiciliar'}
                      onChange={(e) => setNewSideEffect({...newSideEffect, location: 'domiciliar'})}
                    />
                    <span>Domiciliar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="location" 
                      value="hospitalar"
                      checked={newSideEffect.location === 'hospitalar'}
                      onChange={(e) => setNewSideEffect({...newSideEffect, location: 'hospitalar'})}
                    />
                    <span>Hospitalar</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição do Efeito</Label>
                <Textarea 
                  placeholder="Descreva o sintoma ou reação que você está sentindo..."
                  value={newSideEffect.effect}
                  onChange={(e) => setNewSideEffect({...newSideEffect, effect: e.target.value})}
                />
              </div>
              <Button onClick={addSideEffect} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Efeito Colateral
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Efeitos Colaterais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sideEffects.map((effect) => (
                  <div key={effect.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${
                          effect.severity === 'grave' ? 'text-red-600' : 
                          effect.severity === 'moderado' ? 'text-orange-600' : 
                          'text-yellow-600'
                        }`} />
                        <div>
                          <p className="text-blue-900">{effect.medication}</p>
                          <p className="text-gray-700">{effect.effect}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={effect.severity === 'grave' ? 'destructive' : 'secondary'}>
                              {effect.severity}
                            </Badge>
                            <Badge variant="outline">
                              {effect.location}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(effect.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Procedimentos Agendados</CardTitle>
                <CardDescription>Próximos exames e consultas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {procedures.map((procedure) => (
                    <Dialog key={procedure.id}>
                      <DialogTrigger asChild>
                        <div className={`border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow-md ${ 
                          procedure.daysUntil <= 3 ? 'border-amber-300 bg-amber-50' : ''
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-blue-900">{procedure.name}</p>
                                <p className="text-gray-600 text-sm">
                                  {new Date(procedure.date).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                                  Clique para ver preparo
                                  <ChevronRight className="w-3 h-3" />
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {procedure.daysUntil <= 7 && (
                                <Badge variant={procedure.daysUntil <= 3 ? 'destructive' : 'secondary'}>
                                  {procedure.daysUntil} dia{procedure.daysUntil !== 1 ? 's' : ''}
                                </Badge>
                              )}
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{procedure.name}</DialogTitle>
                          <DialogDescription>
                            Agendado para {new Date(procedure.date).toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-blue-900 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Preparo Necessário:
                            </h4>
                            <p className="text-gray-700">{procedure.preparation}</p>
                          </div>
                          {procedure.daysUntil <= 7 && (
                            <Alert>
                              <Bell className="h-4 w-4" />
                              <AlertTitle>Lembrete</AlertTitle>
                              <AlertDescription>
                                Este procedimento está agendado para daqui a {procedure.daysUntil} dia{procedure.daysUntil !== 1 ? 's' : ''}. 
                                Não esqueça do preparo necessário!
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
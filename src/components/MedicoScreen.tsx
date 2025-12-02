import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar, FileText, Pill, Activity, Plus, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { supabase } from '../supabaseClient';

interface TreatmentRecord {
  id: string;
  date: string;
  phase: string;
  description: string;
  status: string;
}

interface Exam {
  id: string;
  date: string;
  type: string;
  status: 'realizado' | 'solicitado';
  results?: string;
}

interface Prescription {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
}

export function MedicoScreen() {
  useEffect(() => {
    fetchTreatments();
    fetchExams();
    fetchPrescriptions();
  }, []);

  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);

  const [exams, setExams] = useState<Exam[]>([]);
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const fetchTreatments = async () => {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.log('Erro ao buscar tratamentos:', error);
    if (data) setTreatments(data);
  };

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.log('Erro ao buscar:', error);
    if (data) setExams(data);
  };

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.log('Erro ao buscar prescrições:', error);
    if (data) setPrescriptions(data);
  };

  const [newTreatment, setNewTreatment] = useState({ phase: '', description: '', status: '' });
  const [newExam, setNewExam] = useState<Partial<Exam>>({ type: '', status: 'solicitado' });
  const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', frequency: '' });

  const addTreatment = async () => {
    if (newTreatment.phase && newTreatment.description) {
      const { error } = await supabase
        .from('treatments')
        .insert([
          {
            date: new Date().toISOString().split('T')[0],
            phase: newTreatment.phase || '',
            description: newTreatment.description || '',
            status: newTreatment.status || 'Planejado'
          }
        ]);

      if (error) {
        alert('Erro ao salvar tratamento!');
        console.log(error);
      } else {
        fetchTreatments(); // Atualiza a lista na hora
        setNewTreatment({ phase: '', description: '', status: '' });
        alert('Tratamento registrado com sucesso!');
      }
    }
  };
// segundo bloco de alteração
  const addExam = async () => {
    if (newExam.type) {
      const { error } = await supabase
        .from('exams')
        .insert([
          {
            type: newExam.type || '',
            status: newExam.status || 'solicitado',
            date: new Date().toISOString().split('T')[0],
            results: newExam.results || ''
          }
        ]);

      if (error) {
        alert('Erro ao salvar: ' + error.message);
      } else {
        fetchExams(); // Atualiza a lista na hora
        setNewExam({ type: '', status: 'solicitado' });
        alert('Exame salvo com sucesso!');
      }
    }
};

  const addPrescription = async () => {
    if (newPrescription.medication && newPrescription.dosage) {
      const { error } = await supabase
        .from('prescriptions')
        .insert([
          {
            date: new Date().toISOString().split('T')[0],
            medication: newPrescription.medication || '',
            dosage: newPrescription.dosage || '',
            frequency: newPrescription.frequency || ''
          }
        ]);

      if (error) {
        alert('Erro ao salvar prescrição!');
        console.log(error);
      } else {
        fetchPrescriptions(); // Atualiza a lista
        setNewPrescription({ medication: '', dosage: '', frequency: '' });
        alert('Prescrição adicionada com sucesso!');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel do Médico</CardTitle>
          <CardDescription>Gerencie tratamentos, exames e prescrições dos pacientes</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tratamento" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tratamento">Tratamento</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="tratamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Tratamento</CardTitle>
              <CardDescription>Adicione informações sobre fase e evolução do tratamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fase do Tratamento</Label>
                  <Select value={newTreatment.phase} onValueChange={(value: string) => setNewTreatment({...newTreatment, phase: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Radioterapia">Radioterapia</SelectItem>
                      <SelectItem value="Quimioterapia">Quimioterapia</SelectItem>
                      <SelectItem value="Imunoterapia">Imunoterapia</SelectItem>
                      <SelectItem value="Hormonioterapia">Hormonioterapia</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newTreatment.status} onValueChange={(value: string) => setNewTreatment({...newTreatment, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planejado">Planejado</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição do Tratamento</Label>
                <Textarea 
                  placeholder="Descreva detalhes do tratamento, sessão, protocolo..."
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})}
                />
              </div>
              <Button onClick={addTreatment} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Registro de Tratamento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Tratamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-900">{treatment.phase}</span>
                        </div>
                        <p className="text-gray-700">{treatment.description}</p>
                      </div>
                      <Badge variant={treatment.status === 'Em andamento' ? 'default' : 'secondary'}>
                        {treatment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{new Date(treatment.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exames" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitar Exame</CardTitle>
              <CardDescription>Registre exames realizados ou solicite novos procedimentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Exame/Procedimento</Label>
                  <Input 
                    placeholder="Ex: Hemograma, Tomografia..."
                    value={newExam.type}
                    onChange={(e) => setNewExam({...newExam, type: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newExam.status} onValueChange={(value: string) => setNewExam({...newExam, status: value as 'realizado' | 'solicitado'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solicitado">Solicitado</SelectItem>
                      <SelectItem value="realizado">Realizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addExam} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Exame
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exames e Procedimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-blue-900">{exam.type}</span>
                        </div>
                        {exam.results && (
                          <p className="text-gray-700 text-sm mt-2">{exam.results}</p>
                        )}
                      </div>
                      <Badge variant={exam.status === 'realizado' ? 'default' : 'outline'}>
                        {exam.status === 'realizado' ? 'Realizado' : 'Solicitado'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-sm">{new Date(exam.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescricoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Prescrição</CardTitle>
              <CardDescription>Prescreva medicamentos e defina dosagem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Medicamento</Label>
                  <Input 
                    placeholder="Nome do medicamento"
                    value={newPrescription.medication}
                    onChange={(e) => setNewPrescription({...newPrescription, medication: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosagem</Label>
                  <Input 
                    placeholder="Ex: 8mg"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Input 
                    placeholder="Ex: 8/8h"
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={addPrescription} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Prescrição
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescrições Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Pill className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-blue-900">{prescription.medication}</p>
                          <p className="text-gray-600 text-sm">
                            {prescription.dosage} - {prescription.frequency}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(prescription.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Paciente</CardTitle>
              <CardDescription>Visão geral do histórico e situação atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tratamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{treatments.length}</div>
                    <p className="text-sm text-gray-600">Registros totais</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Exames</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{exams.length}</div>
                    <p className="text-sm text-gray-600">
                      {exams.filter(e => e.status === 'solicitado').length} solicitados
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prescrições</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{prescriptions.length}</div>
                    <p className="text-sm text-gray-600">Medicamentos ativos</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-blue-900">Atualização da Situação</h3>
                <Textarea 
                  placeholder="Digite observações sobre a evolução do paciente, mudanças no quadro clínico, ajustes necessários no tratamento..."
                  rows={6}
                />
                <Button className="w-full">Salvar Atualização</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

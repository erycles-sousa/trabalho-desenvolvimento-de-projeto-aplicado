import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { MessageSquare, Home, Hospital, Pill, Activity, AlertCircle, Plus, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { supabase } from '../supabaseClient';

interface PatientReport {
  id: string;
  date: string;
  type: 'efeito_colateral' | 'duvida' | 'urgente';
  description: string;
  medication?: string;
  severity?: 'leve' | 'moderado' | 'grave';
  status: 'pendente' | 'em_analise' | 'resolvido';
  response?: string;
}

interface Guidance {
  id: string;
  date: string;
  reportId: string;
  recommendation: 'visita_hospital' | 'tratamento_domiciliar' | 'acompanhamento';
  instructions: string;
}

interface NursePrescription {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  duration: string;
  reason: string;
}

export function EnfermeiroScreen() {
  const [reports, setReports] = useState<PatientReport[]>([
    {
      id: '1',
      date: '2025-11-07',
      type: 'efeito_colateral',
      description: 'Náusea intensa após medicação matinal',
      medication: 'Ondansetrona',
      severity: 'moderado',
      status: 'pendente'
    },
    {
      id: '2',
      date: '2025-11-06',
      type: 'duvida',
      description: 'Posso tomar o medicamento com alimentos?',
      medication: 'Dexametasona',
      status: 'resolvido',
      response: 'Sim, pode tomar com alimentos. Recomendamos tomar após refeição para diminuir efeitos gástricos.'
    },
    {
      id: '3',
      date: '2025-11-05',
      type: 'efeito_colateral',
      description: 'Dor de cabeça persistente há 2 dias',
      severity: 'leve',
      status: 'resolvido',
      response: 'Orientado hidratação e repouso. Caso persista, contatar equipe.'
    }
  ]);

  const [guidances, setGuidances] = useState<Guidance[]>([
    {
      id: '1',
      date: '2025-11-06',
      reportId: '2',
      recommendation: 'tratamento_domiciliar',
      instructions: 'Medicação pode ser tomada com alimentos. Aumentar hidratação.'
    }
  ]);

  const [prescriptions, setPrescriptions] = useState<NursePrescription[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from('nurse_prescriptions')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) console.log('Erro ao buscar:', error);
    if (data) setPrescriptions(data);
  };

  const [newGuidance, setNewGuidance] = useState<Partial<Guidance>>({
    reportId: '',
    recommendation: 'tratamento_domiciliar',
    instructions: ''
  });

  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    duration: '',
    reason: ''
  });

  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);

  const updateReportStatus = (reportId: string, status: PatientReport['status'], response?: string) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status, response } : report
    ));
  };

  const addGuidance = (reportId: string) => {
    if (newGuidance.instructions) {
      const guidance: Guidance = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        reportId,
        instructions: newGuidance.instructions || '',
        recommendation: newGuidance.recommendation || 'tratamento_domiciliar',
      };
      setGuidances([...guidances, guidance]);
      updateReportStatus(reportId, 'resolvido', newGuidance.instructions);
      setNewGuidance({
        reportId: '',
        recommendation: 'tratamento_domiciliar',
        instructions: ''
      });
      setSelectedReport(null);
    }
  };

  const addPrescription = async () => {
    if (newPrescription.medication && newPrescription.dosage) {
      const { error } = await supabase
        .from('nurse_prescriptions')
        .insert([
          {
            date: new Date().toISOString().split('T')[0],
            medication: newPrescription.medication || '',
            dosage: newPrescription.dosage || '',
            duration: newPrescription.duration || '',
            reason: newPrescription.reason || ''
          }
        ]);

      if (error) {
        alert('Erro ao salvar!');
        console.log(error);
      } else {
        fetchPrescriptions();
        setNewPrescription({
          medication: '',
          dosage: '',
          duration: '',
          reason: ''
        });
        alert('Prescrição adicionada com sucesso!');
      }
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pendente');
  const urgentReports = reports.filter(r => r.type === 'urgente' || r.severity === 'grave');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Enfermagem</CardTitle>
          <CardDescription>Monitore relatos dos pacientes e forneça orientações</CardDescription>
        </CardHeader>
      </Card>

      {urgentReports.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Atenção Necessária</AlertTitle>
          <AlertDescription className="text-red-800">
            Há {urgentReports.length} relato(s) que requer(em) atenção urgente.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="relatos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="relatos">
            Relatos
            {pendingReports.length > 0 && (
              <Badge className="ml-2" variant="destructive">{pendingReports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orientacoes">Orientações</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        <TabsContent value="relatos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatos dos Pacientes</CardTitle>
              <CardDescription>Analise e responda aos relatos de efeitos colaterais e dúvidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <Dialog key={report.id}>
                    <DialogTrigger asChild>
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          report.status === 'pendente' ? 'border-l-4 border-l-amber-500' : ''
                        } ${
                          report.severity === 'grave' || report.type === 'urgente' ? 'border-l-4 border-l-red-500' : ''
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <MessageSquare className={`w-5 h-5 mt-0.5 ${
                              report.type === 'urgente' || report.severity === 'grave' ? 'text-red-600' : 
                              report.type === 'efeito_colateral' ? 'text-orange-600' : 
                              'text-blue-600'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  report.type === 'urgente' ? 'destructive' :
                                  report.type === 'efeito_colateral' ? 'default' :
                                  'secondary'
                                }>
                                  {report.type === 'efeito_colateral' ? 'Efeito Colateral' :
                                   report.type === 'urgente' ? 'Urgente' :
                                   'Dúvida'}
                                </Badge>
                                {report.severity && (
                                  <Badge variant={
                                    report.severity === 'grave' ? 'destructive' :
                                    report.severity === 'moderado' ? 'default' :
                                    'secondary'
                                  }>
                                    {report.severity}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-900">{report.description}</p>
                              {report.medication && (
                                <p className="text-sm text-gray-600 mt-1">Medicamento: {report.medication}</p>
                              )}
                              {report.response && (
                                <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                  <p className="text-green-900">Resposta: {report.response}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={
                              report.status === 'pendente' ? 'outline' :
                              report.status === 'em_analise' ? 'default' :
                              'secondary'
                            }>
                              {report.status === 'pendente' ? 'Pendente' :
                               report.status === 'em_analise' ? 'Em Análise' :
                               'Resolvido'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(report.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Responder Relato</DialogTitle>
                        <DialogDescription>
                          Forneça orientação e recomendação para o paciente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-blue-900 mb-2">Relato do Paciente:</p>
                          <p className="text-gray-700">{report.description}</p>
                          {report.medication && (
                            <p className="text-sm text-gray-600 mt-2">Medicamento: {report.medication}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Recomendação</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newGuidance.recommendation}
                            onChange={(e) => setNewGuidance({...newGuidance, recommendation: e.target.value as any})}
                          >
                            <option value="tratamento_domiciliar">Tratamento Domiciliar</option>
                            <option value="visita_hospital">Visita ao Hospital</option>
                            <option value="acompanhamento">Acompanhamento</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Orientações e Instruções</Label>
                          <Textarea 
                            placeholder="Descreva as orientações e cuidados que o paciente deve seguir..."
                            rows={5}
                            value={newGuidance.instructions}
                            onChange={(e) => setNewGuidance({...newGuidance, instructions: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-2">
                          {newGuidance.recommendation === 'visita_hospital' && (
                            <Button className="flex-1" variant="destructive" onClick={() => addGuidance(report.id)}>
                              <Hospital className="w-4 h-4 mr-2" />
                              Recomendar Visita ao Hospital
                            </Button>
                          )}
                          {newGuidance.recommendation === 'tratamento_domiciliar' && (
                            <Button className="flex-1" onClick={() => addGuidance(report.id)}>
                              <Home className="w-4 h-4 mr-2" />
                              Orientar Tratamento Domiciliar
                            </Button>
                          )}
                          {newGuidance.recommendation === 'acompanhamento' && (
                            <Button className="flex-1" variant="secondary" onClick={() => addGuidance(report.id)}>
                              <Activity className="w-4 h-4 mr-2" />
                              Solicitar Acompanhamento
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orientacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Orientações</CardTitle>
              <CardDescription>Orientações fornecidas aos pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guidances.map((guidance) => {
                  const relatedReport = reports.find(r => r.id === guidance.reportId);
                  return (
                    <div key={guidance.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {guidance.recommendation === 'visita_hospital' && (
                            <Hospital className="w-5 h-5 text-red-600" />
                          )}
                          {guidance.recommendation === 'tratamento_domiciliar' && (
                            <Home className="w-5 h-5 text-green-600" />
                          )}
                          {guidance.recommendation === 'acompanhamento' && (
                            <Activity className="w-5 h-5 text-blue-600" />
                          )}
                          <Badge variant={
                            guidance.recommendation === 'visita_hospital' ? 'destructive' :
                            guidance.recommendation === 'tratamento_domiciliar' ? 'default' :
                            'secondary'
                          }>
                            {guidance.recommendation === 'visita_hospital' ? 'Visita ao Hospital' :
                             guidance.recommendation === 'tratamento_domiciliar' ? 'Tratamento Domiciliar' :
                             'Acompanhamento'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(guidance.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {relatedReport && (
                        <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
                          <p className="text-gray-600">Relato: {relatedReport.description}</p>
                        </div>
                      )}
                      <p className="text-gray-700">{guidance.instructions}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescricoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Prescrição de Enfermagem</CardTitle>
              <CardDescription>Prescreva medicamentos conforme protocolo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ex: 500mg"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração do Tratamento</Label>
                  <Input 
                    placeholder="Ex: 5 dias, 2 semanas"
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input 
                    placeholder="Ex: Controle de dor"
                    value={newPrescription.reason}
                    onChange={(e) => setNewPrescription({...newPrescription, reason: e.target.value})}
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
              <CardTitle>Prescrições de Enfermagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Pill className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-blue-900">{prescription.medication}</p>
                          <p className="text-gray-600 text-sm">
                            {prescription.dosage} - {prescription.duration}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            Motivo: {prescription.reason}
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
              <CardTitle>Resumo da Atividade</CardTitle>
              <CardDescription>Visão geral do atendimento e histórico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Relatos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{reports.length}</div>
                    <p className="text-sm text-gray-600">
                      {pendingReports.length} pendente{pendingReports.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Orientações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{guidances.length}</div>
                    <p className="text-sm text-gray-600">Fornecidas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prescrições</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-blue-900">{prescriptions.length}</div>
                    <p className="text-sm text-gray-600">Realizadas</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-blue-900">Atualização do Paciente</h3>
                <Textarea 
                  placeholder="Registre observações sobre evolução do paciente, resposta aos tratamentos, necessidade de ajustes..."
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

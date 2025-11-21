import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Stethoscope, User, HeartPulse } from 'lucide-react';
import { MedicoScreen } from './components/MedicoScreen';
import { PacienteScreen } from './components/PacienteScreen';
import { EnfermeiroScreen } from './components/EnfermeiroScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('medico');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6 text-center">
            <h1 className="text-blue-900 mb-2"> Sistema de Acompanhamento Médico</h1>
          <p className="text-gray-600">Centralize informações médicas e facilite a comunicação entre equipe e pacientes</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="medico" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="paciente" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Paciente
            </TabsTrigger>
            <TabsTrigger value="enfermeiro" className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4" />
              Enfermagem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medico">
            <MedicoScreen />
          </TabsContent>

          <TabsContent value="paciente">
            <PacienteScreen />
          </TabsContent>

          <TabsContent value="enfermeiro">
            <EnfermeiroScreen />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

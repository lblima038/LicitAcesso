import { Bid, User, BidDocument, DocumentStatus } from '../domain/entities';
import { IBidRepository, IUserRepository } from '../domain/repositories';

export class MockBidRepository implements IBidRepository {
  private bids: Bid[] = [
    {
      id: '1',
      title: 'Manutenção Escolar - Zona Leste',
      description: 'Serviços preventivos e corretivos em unidades da rede municipal. Elétrica e pintura.',
      organization: 'Prefeitura de SP',
      estimatedValue: 45000,
      deadline: '22 de Outubro',
      location: 'São Paulo, SP',
      category: 'Serviços',
      matchPercentage: 98,
    },
    {
      id: '2',
      title: 'Reparo de Grades e Cercamento',
      description: 'Pequena reforma em parque municipal. Estruturas metálicas e alvenaria simples.',
      organization: 'Prefeitura de Osasco',
      estimatedValue: 12800,
      deadline: '15 de Novembro',
      location: 'Osasco, SP',
      category: 'Obras',
      isUrgent: true,
    },
    {
      id: '3',
      title: 'Fornecimento de Materiais de Escritório',
      description: 'Papelaria básica para secretarias municipais.',
      organization: 'Prefeitura de Santo André',
      estimatedValue: 5400,
      deadline: '22 de Outubro',
      location: 'Santo André, SP',
      category: 'Papelaria',
    },
  ];

  async getAvailableBids(): Promise<Bid[]> {
    return this.bids;
  }

  async getBidDetails(id: string): Promise<Bid | null> {
    return this.bids.find(b => b.id === id) || null;
  }

  async getRecommendedBids(): Promise<Bid[]> {
    return this.bids.filter(b => b.matchPercentage && b.matchPercentage > 90);
  }
}

export class MockUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User | null> {
    return {
      id: 'u1',
      name: 'Carlos',
      email: 'carlos@exemplo.com',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
    };
  }

  async getDocumentsForBid(_bidId: string): Promise<BidDocument[]> {
    return [
      {
        id: 'd1',
        title: 'CCMEI',
        status: DocumentStatus.OK,
        lastUpdated: '12/10',
        description: 'Certificado de Condição de Microempreendedor Individual',
      },
      {
        id: 'd2',
        title: 'RG / CPF Sócios',
        status: DocumentStatus.OK,
        description: 'Digitalização colorida dos documentos de identidade',
      },
      {
        id: 'd3',
        title: 'Certidão Negativa (União)',
        status: DocumentStatus.PENDING,
        description: 'Prova de regularidade fiscal perante a Fazenda Nacional',
        actionUrl: 'https://gov.br',
      },
      {
        id: 'd4',
        title: 'Certidão Municipal',
        status: DocumentStatus.PENDING,
        description: 'Necessário para este edital',
      },
      {
        id: 'd5',
        title: 'Atestado de Capacidade',
        status: DocumentStatus.PROCESSING,
        description: 'Aguardando assinatura do contratante anterior',
      },
    ];
  }
}

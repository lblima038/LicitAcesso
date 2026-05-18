import { useState, useEffect } from 'react';
import { Bid, User, BidDocument } from '../domain/entities';
import { MockBidRepository, MockUserRepository } from '../data/repositories';

const bidRepo = new MockBidRepository();
const userRepo = new MockUserRepository();

export function useDashboardViewModel() {
  const [user, setUser] = useState<User | null>(null);
  const [recommendedBids, setRecommendedBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [currentUser, recommendations] = await Promise.all([
        userRepo.getCurrentUser(),
        bidRepo.getRecommendedBids(),
      ]);
      setUser(currentUser);
      setRecommendedBids(recommendations);
      setLoading(false);
    }
    loadData();
  }, []);

  return { user, recommendedBids, loading };
}

export function useEditaisViewModel() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBids() {
    setLoading(true);
    setError(null);
    try {
      const allBids = await bidRepo.getAvailableBids();
      setBids(allBids);
    } catch {
      setError('Não foi possível carregar as oportunidades.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBids(); }, []);

  const filteredBids = bids.filter(bid =>
    bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { filteredBids, searchQuery, setSearchQuery, loading, error, retry: loadBids };
}

export function useBidDetailViewModel(id: string) {
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBid() {
    setLoading(true);
    setError(null);
    try {
      const details = await bidRepo.getBidDetails(id);
      setBid(details);
    } catch {
      setError('Não foi possível carregar o edital.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBid(); }, [id]);

  return { bid, loading, error, retry: loadBid };
}

export function useChecklistViewModel(bidId: string) {
  const [documents, setDocuments] = useState<BidDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      const docs = await userRepo.getDocumentsForBid(bidId);
      setDocuments(docs);
      setLoading(false);
    }
    loadDocs();
  }, [bidId]);

  const progress =
    documents.length > 0
      ? Math.round(
          (documents.filter(d => d.status === 'ok').length / documents.length) * 100
        )
      : 0;

  return { documents, progress, loading };
}

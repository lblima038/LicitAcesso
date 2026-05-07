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

  useEffect(() => {
    async function loadBids() {
      const allBids = await bidRepo.getAvailableBids();
      setBids(allBids);
      setLoading(false);
    }
    loadBids();
  }, []);

  const filteredBids = bids.filter(bid =>
    bid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return { filteredBids, searchQuery, setSearchQuery, loading };
}

export function useBidDetailViewModel(id: string) {
  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBid() {
      const details = await bidRepo.getBidDetails(id);
      setBid(details);
      setLoading(false);
    }
    loadBid();
  }, [id]);

  return { bid, loading };
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

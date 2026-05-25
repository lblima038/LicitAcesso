import { Bid, User, BidDocument } from './entities';

export interface IBidRepository {
  getAvailableBids(): Promise<Bid[]>;
  getBidDetails(id: string): Promise<Bid | null>;
  getRecommendedBids(): Promise<Bid[]>;
}

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  getDocumentsForBid(bidId: string): Promise<BidDocument[]>;
}

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Post } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

const POSTS_PATH = 'posts';

export const firestorePostsService = {
  // Subscribe to real-time posts from Cloud Firestore across all tabs & devices
  subscribePosts(onPostsUpdated: (posts: Post[]) => void, onError?: (err: Error) => void) {
    const postsCol = collection(db, POSTS_PATH);
    return onSnapshot(
      postsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed with initial posts
          try {
            await this.seedInitialPosts(INITIAL_POSTS);
          } catch (e) {
            console.error('Failed to seed initial posts:', e);
          }
          return;
        }

        const remotePosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          remotePosts.push(docSnap.data() as Post);
        });

        // Sort by publication date descending
        remotePosts.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        });

        onPostsUpdated(remotePosts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, POSTS_PATH);
        if (onError) onError(error as Error);
      }
    );
  },

  // Save or update a post in Firestore
  async savePost(post: Post): Promise<void> {
    const postToSave: Post = {
      ...post,
      id: post.id || `post-${Date.now()}`,
      publishedAt: post.publishedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: post.views || 0,
      status: post.status || 'published',
    };

    try {
      await setDoc(doc(db, POSTS_PATH, postToSave.id), postToSave);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${POSTS_PATH}/${postToSave.id}`);
    }
  },

  // Delete a post from Firestore
  async deletePost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, POSTS_PATH, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${POSTS_PATH}/${id}`);
    }
  },

  // Seed initial posts
  async seedInitialPosts(initialPosts: Post[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const p of initialPosts) {
        batch.set(doc(db, POSTS_PATH, p.id), p);
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, POSTS_PATH);
    }
  },

  // Increment views
  async incrementView(id: string, currentViews: number): Promise<void> {
    try {
      await setDoc(
        doc(db, POSTS_PATH, id),
        { views: (currentViews || 0) + 1 },
        { merge: true }
      );
    } catch (error) {
      console.warn('View increment failed:', error);
    }
  }
};

'use client';

import React, { useEffect, useState } from 'react';

interface Post {
  id: number;
  title: string;
  description: string;
  likes: number;
  userHasLiked: boolean;
}

class PostModel implements Post {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public likes: number,
    public userHasLiked: boolean
  ) {}
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<PostModel | null>(null);

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('https://simuate-test-backend-1.onrender.com/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const postsData = data.posts.map(
        (post: Post) =>
          new PostModel(post.id, post.title, post.description, post.likes, post.userHasLiked)
      );
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error al obtener los posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const post = posts.find((post) => post.id === id);
    if (!post) return;

    const newLikes = post.userHasLiked ? post.likes - 1 : post.likes + 1;
    const newUserHasLiked = !post.userHasLiked;

    try {
      const response = await fetch(`https://simuate-test-backend-1.onrender.com/api/posts/${id}/like`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ like: newUserHasLiked }),
      });

      if (response.ok) {
        await fetchPosts();
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === id
              ? new PostModel(p.id, p.title, p.description, newLikes, newUserHasLiked)
              : p
          )
        );
      } else {
        throw new Error('Error al actualizar el like');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      setError('Error al actualizar el like');
    }
  };

  const handleAddPost = async () => {
    const token = localStorage.getItem('token');

    if (!title || !description) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('https://simuate-test-backend-1.onrender.com/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          user_id: 16,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts((prevPosts) => [
          ...prevPosts,
          new PostModel(newPost.id, newPost.title, newPost.description, 0, false)
        ]);
        setTitle('');
        setDescription('');
        setError('');
        setIsAddModalOpen(false);
      } else {
        throw new Error('Error al agregar el post');
      }
    } catch (error) {
      console.error('Error adding post:', error);
      setError('Error al agregar el post');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !title || !description) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const deleteResponse = await fetch(`https://simuate-test-backend-1.onrender.com/api/posts/${editingPost.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!deleteResponse.ok)
         {
        throw new Error('Error al eliminar el post');
      }

      const postData = {
        title,
        description,
        user_id: 16 
      };

      const createResponse = await fetch('https://simuate-test-backend-1.onrender.com/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (createResponse.ok) {
        const newPost = await createResponse.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === editingPost.id
              ? new PostModel(newPost.id, newPost.title, newPost.description, 0, false)
              : post
              
          )
        );
        setTitle('');
        setDescription('');
        setError('');
        setIsEditModalOpen(false);
        setEditingPost(null);
      } else {
        throw new Error('Error al actualizar el post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Error al actualizar el post');
    }
  };

  const handleDeletePost = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`https://simuate-test-backend-1.onrender.com/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      } else {
        await fetchPosts();
        throw new Error('Error al eliminar el post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error al eliminar el post');
      await fetchPosts();
    }
  };

  const handleEditClick = (post: PostModel) => {
    setTitle(post.title);
    setDescription(post.description);
    setEditingPost(post);
    setIsEditModalOpen(true);
    
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div>
      <h1>Publicaciones</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
      <button onClick={() => setIsAddModalOpen(true)}>+</button>
      {isAddModalOpen && (
        <div>
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              {error && <div>{error}</div>}
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button type="button" onClick={handleAddPost}>Agregar Post</button>
              <button onClick={() => setIsAddModalOpen(false)}>X</button>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && editingPost && (
        <div>
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              {error && <div>{error}</div>}
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button type="button" onClick={handleUpdatePost}>Actualizar Post</button>
              <button onClick={() => setIsEditModalOpen(false)}>X</button>
            </form>
          </div>
        </div>
      )}
      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <div>
              <button onClick={() => handleLike(post.id)}>
                {post.userHasLiked ? 'Unlike' : 'Like'} ({post.likes})
              </button>
              <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              <button onClick={() => handleEditClick(post)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

export const validateTitle = (title) => {
  let error = '';
  
  if (!title || title.trim() === '') {
    error = 'Title is required';
  } else if (title.length < 3) {
    error = 'Title must be at least 3 characters long';
  } else if (title.length > 100) {
    error = 'Title cannot exceed 100 characters';
  }

  return error;
};

export const validateContent = (content) => {
  let error = '';

  if (!content || content.trim() === '') {
    error = 'Content is required';
  } else if (content.length < 3) {
    error = 'Content must be at least 3 characters long'; 
  } else if (content.length > 5000) {
    error = 'Content cannot exceed 5000 characters';
  }

  return error;
};

export const validateImage = (image) => {
  let error = '';

  if (image) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(image.type)) {
      error = 'Only JPG, PNG and GIF images are allowed';
    } else if (image.size > maxSize) {
      error = 'Image size cannot exceed 5MB';
    }
  }

  return error;
};

export const validatePost = (post) => {
  const errors = {
    title: validateTitle(post.title),
    content: validateContent(post.content),
    image: validateImage(post.image)
  };

  const isValid = Object.values(errors).every(error => error === '');
  
  return {
    isValid,
    errors
  };
};
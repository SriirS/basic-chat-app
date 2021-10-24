const generateMessage = (username, message) => {
  return {
    username,
    message,
    createdAt: new Date(),
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date(),
  };
};

module.exports = {
  generateLocationMessage,
  generateMessage,
};

import { useState, useEffect } from "react";
import styles from "./Messages.module.css";

export default function Messages({ currentUser, onClose }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users.filter(u => u.id !== currentUser.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (userId) => {
    setSelectedConversation(userId);
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${currentUser.id}/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedConversation,
          text: newMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Utilisateur";
  };

  const getOtherUserPhoto = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.profilePhoto || null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.header}>
        <h2>💬 Messages</h2>
        {onClose && <button onClick={onClose} className={styles.closeBtn}>✕</button>}
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h3>Utilisateurs</h3>
          <div className={styles.users}>
            {loading ? (
              <p className={styles.empty}>Chargement...</p>
            ) : users.length === 0 ? (
              <p className={styles.empty}>Aucun utilisateur</p>
            ) : (
              users.map(user => (
                <div
                  key={user.id}
                  className={`${styles.user} ${selectedConversation === user.id ? styles.active : ""}`}
                  onClick={() => openConversation(user.id)}
                >
                  <div className={styles.userPhoto}>
                    {user.profilePhoto ? (
                      <img src={`http://localhost:5000${user.profilePhoto}`} alt={user.name} />
                    ) : (
                      <div className={styles.photoPlaceholder}>{user.name[0].toUpperCase()}</div>
                    )}
                  </div>
                  <span>{user.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.chatContainer}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.headerInfo}>
                  {getOtherUserPhoto(selectedConversation) ? (
                    <img 
                      src={`http://localhost:5000${getOtherUserPhoto(selectedConversation)}`} 
                      alt={getOtherUserName(selectedConversation)}
                      className={styles.headerPhoto}
                    />
                  ) : (
                    <div className={styles.headerPhotoPlaceholder}>
                      {getOtherUserName(selectedConversation)[0].toUpperCase()}
                    </div>
                  )}
                  <h3>{getOtherUserName(selectedConversation)}</h3>
                </div>
              </div>

              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <div className={styles.emptyChat}>
                    <p>Aucun message. Commencez la conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${msg.senderId === currentUser.id ? styles.sent : styles.received}`}
                    >
                      <div className={styles.messageBubble}>
                        <p>{msg.text}</p>
                        <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className={styles.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoFocus
                />
                <button type="submit" disabled={!newMessage.trim()}>Envoyer</button>
              </form>
            </>
          ) : (
            <div className={styles.noChat}>
              <p>👋 Sélectionnez un utilisateur pour commencer une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

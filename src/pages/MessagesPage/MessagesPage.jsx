import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import ScreenState from '../../components/ScreenState/ScreenState'
import { CURRENT_USER } from '../../config/currentUser'
import {
  createMessage,
  deleteMessage,
  listMessages,
  markAsRead,
  updateMessage,
} from '../../services/messageService'
import { listUsers, userLabel } from '../../services/userService'
import { formatShortDate } from '../../utils/dates'
import styles from './MessagesPage.module.css'

const ME = CURRENT_USER.userId

// HU17 - Gestionar mensajes.
export default function MessagesPage() {
  const [loadState, setLoadState] = useState('loading')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('received')
  const [selectedId, setSelectedId] = useState(null)
  const [editText, setEditText] = useState(null) // null = not editing
  const [feedback, setFeedback] = useState(null)
  const [newMessage, setNewMessage] = useState({ receiverId: '', content: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([listMessages(), listUsers()])
      .then(([loadedMessages, loadedUsers]) => {
        if (!active) return
        setMessages(loadedMessages)
        setUsers(loadedUsers)
        setLoadState('ready')
      })
      .catch(() => {
        if (active) setLoadState('error')
      })
    return () => {
      active = false
    }
  }, [])

  function nameOf(userId) {
    const user = users.find((item) => item.id === userId)
    return user ? user.name : `Usuario ${userId}`
  }

  function replaceMessage(updated) {
    setMessages((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  function changeTab(nextTab) {
    setTab(nextTab)
    setSelectedId(null)
    setEditText(null)
    setFeedback(null)
  }

  // Opening a received message that is still unread marks it as read.
  async function openMessage(message) {
    setSelectedId(message.id)
    setEditText(null)
    setFeedback(null)
    if (message.receiverId === ME && !message.read) {
      try {
        replaceMessage(await markAsRead(message.id, ME))
      } catch (error) {
        setFeedback({ type: 'error', text: error.message })
      }
    }
  }

  async function handleSaveEdit() {
    try {
      replaceMessage(await updateMessage(selectedId, { content: editText }))
      setEditText(null)
      setFeedback({ type: 'success', text: 'Mensaje actualizado.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  async function handleDelete() {
    try {
      await deleteMessage(selectedId, ME)
      setMessages((current) => current.filter((item) => item.id !== selectedId))
      setSelectedId(null)
      setFeedback({ type: 'success', text: 'Mensaje eliminado.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    }
  }

  async function handleSend(event) {
    event.preventDefault()
    setFormError('')
    try {
      const created = await createMessage({
        senderId: ME,
        receiverId: newMessage.receiverId ? Number(newMessage.receiverId) : null,
        content: newMessage.content,
      })
      setMessages((current) => [...current, created])
      setNewMessage({ receiverId: '', content: '' })
      setTab('sent')
      setSelectedId(created.id)
      setEditText(null)
      setFeedback({ type: 'success', text: 'Mensaje enviado.' })
    } catch (error) {
      setFormError(error.message)
    }
  }

  if (loadState === 'loading') return <ScreenState state="loading" />
  if (loadState === 'error') return <ScreenState state="error" />

  const visible = messages
    .filter((item) => (tab === 'sent' ? item.senderId === ME : item.receiverId === ME))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  const selected = visible.find((item) => item.id === selectedId) ?? null
  const isSender = selected?.senderId === ME

  return (
    <>
      <h1>Mensajes</h1>
      <p className={styles.subtitle}>Comunícate con otros usuarios durante el proceso de adopción.</p>

      <div className={styles.layout}>
        <Card>
          <div className={styles.tabs} role="group" aria-label="Bandeja">
            <Button
              variant={tab === 'received' ? 'primary' : 'secondary'}
              aria-pressed={tab === 'received'}
              onClick={() => changeTab('received')}
            >
              Recibidos
            </Button>
            <Button
              variant={tab === 'sent' ? 'primary' : 'secondary'}
              aria-pressed={tab === 'sent'}
              onClick={() => changeTab('sent')}
            >
              Enviados
            </Button>
          </div>

          {visible.length === 0 ? (
            <ScreenState state="empty" message="No hay mensajes en esta bandeja." />
          ) : (
            <ul className={styles.list}>
              {visible.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    className={`${styles.item} ${message.id === selectedId ? styles.itemSelected : ''}`}
                    aria-current={message.id === selectedId}
                    onClick={() => openMessage(message)}
                  >
                    <span className={styles.itemText}>
                      <strong>
                        {tab === 'sent'
                          ? `Para: ${nameOf(message.receiverId)}`
                          : `De: ${nameOf(message.senderId)}`}
                      </strong>
                      <span className={styles.preview}>{message.content}</span>
                      <span className={styles.date}>{formatShortDate(message.date)}</span>
                    </span>
                    <Badge tone={message.read ? 'success' : 'warning'}>
                      {message.read ? 'Leído' : 'No leído'}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className={styles.column}>
          <Card title="Mensaje seleccionado">
            {selected ? (
              <>
                <div className={styles.meta}>
                  <span>
                    <strong>De:</strong> {nameOf(selected.senderId)}
                  </span>
                  <span>
                    <strong>Para:</strong> {nameOf(selected.receiverId)}
                  </span>
                  <span>
                    <strong>Fecha:</strong> {selected.date}
                  </span>
                  <Badge tone={selected.read ? 'success' : 'warning'}>
                    {selected.read ? 'Leído' : 'No leído'}
                  </Badge>
                </div>

                {editText === null ? (
                  <p className={styles.body}>{selected.content}</p>
                ) : (
                  <textarea
                    aria-label="Editar contenido del mensaje"
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                  />
                )}

                <div className={styles.actions}>
                  {editText === null ? (
                    <>
                      {isSender && (
                        <Button
                          variant="secondary"
                          disabled={selected.read}
                          onClick={() => setEditText(selected.content)}
                        >
                          Editar
                        </Button>
                      )}
                      <Button variant="danger" disabled={!selected.read} onClick={handleDelete}>
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleSaveEdit}>Guardar cambios</Button>
                      <Button variant="secondary" onClick={() => setEditText(null)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
                {editText === null && !selected.read && (
                  <p className={styles.hint}>
                    Solo se puede eliminar un mensaje después de que haya sido leído.
                  </p>
                )}
                {editText === null && selected.read && isSender && (
                  <p className={styles.hint}>Un mensaje leído ya no se puede editar.</p>
                )}
              </>
            ) : (
              <p className={styles.hint}>Selecciona un mensaje de la lista para leerlo.</p>
            )}
            {feedback && (
              <p
                className={feedback.type === 'error' ? styles.error : styles.success}
                role={feedback.type === 'error' ? 'alert' : 'status'}
              >
                {feedback.text}
              </p>
            )}
          </Card>

          <Card title="Nuevo mensaje">
            <form onSubmit={handleSend} noValidate>
              <div className={styles.field}>
                <label htmlFor="message-to">
                  Para <span className={styles.required}>*</span>
                </label>
                <select
                  id="message-to"
                  value={newMessage.receiverId}
                  onChange={(event) =>
                    setNewMessage({ ...newMessage, receiverId: event.target.value })
                  }
                >
                  <option value="">Selecciona un destinatario</option>
                  {users
                    .filter((user) => user.id !== ME)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {userLabel(user)}
                      </option>
                    ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="message-content">
                  Contenido <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="message-content"
                  placeholder="Escribe tu mensaje…"
                  value={newMessage.content}
                  onChange={(event) =>
                    setNewMessage({ ...newMessage, content: event.target.value })
                  }
                />
                <p className={styles.help}>Obligatorio. No puedes enviarte mensajes a ti mismo(a).</p>
              </div>
              {formError && (
                <p className={styles.error} role="alert">
                  {formError}
                </p>
              )}
              <Button type="submit">Enviar mensaje</Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DemoContext = createContext(null)
const initial = { selectedAgentIds: ['buffett', 'dalio', 'taleb'], captainId: 'dalio', selectedEventId: 'gfc' }

export function DemoProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem('qell-v2-demo')) } }
    catch { return initial }
  })

  useEffect(() => { localStorage.setItem('qell-v2-demo', JSON.stringify(state)) }, [state])

  const value = useMemo(() => ({
    ...state,
    addAgent(id) {
      setState((current) => current.selectedAgentIds.includes(id) || current.selectedAgentIds.length >= 3
        ? current
        : { ...current, selectedAgentIds: [...current.selectedAgentIds, id] })
    },
    removeAgent(id) {
      setState((current) => ({
        ...current,
        selectedAgentIds: current.selectedAgentIds.filter((item) => item !== id),
        captainId: current.captainId === id ? current.selectedAgentIds.find((item) => item !== id) ?? '' : current.captainId,
      }))
    },
    setCaptain(id) { setState((current) => ({ ...current, captainId: id })) },
    setSelectedEvent(id) { setState((current) => ({ ...current, selectedEventId: id })) },
  }), [state])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export const useDemo = () => useContext(DemoContext)

import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface DarkModeState {
  isOn: boolean
}

const initialState: DarkModeState = {
  isOn : (localStorage.getItem("theme") === "dark")
}

export const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggle: (state) => {
      state.isOn = !state.isOn
      localStorage.setItem("theme", state.isOn ? "dark" : "light");
    }
  },
})

export const { toggle } = darkModeSlice.actions
export const selectDarkMode = (state: RootState) => state.darkMode.isOn;
export default darkModeSlice.reducer
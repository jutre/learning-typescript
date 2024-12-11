import { Provider } from 'react-redux';
import store from './store/store';
import Layout from "./components/Layout.tsx";
import "./App.scss";

/**
 * 
 * This app was created to get experience with react, react-redux libraries. 
 * 
 * In this app state modifications are performed: creating, updating, deleting objects in redux store
 */
const App = () => {
  return (
    <Provider store={store}>
      <Layout/>
    </Provider>
  )
}
export default App;
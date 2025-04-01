import { ClipLoader } from "react-spinners";

// Spinner.js

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
    <ClipLoader color={'teal'} loading={true} size={150} />
  </div>
);

export default Spinner;
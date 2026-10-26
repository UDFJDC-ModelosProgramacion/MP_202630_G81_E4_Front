import { useEffect, useState } from 'react';
import { getAvailablePets } from '../../services/petService';
import styles from './PetsPage.module.css';

export const PetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de búsqueda
  const [searchName, setSearchName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedShelter, setSelectedShelter] = useState('');

  useEffect(() => {
    getAvailablePets()
      .then((data) => {
        setPets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredPets = pets.filter((pet) => {
    const matchesName = pet.name?.toLowerCase().includes(searchName.toLowerCase());
    const matchesSpecies = selectedSpecies ? pet.species?.toLowerCase().includes(selectedSpecies.toLowerCase()) : true;
    const matchesBreed = selectedBreed ? pet.breed?.toLowerCase().includes(selectedBreed.toLowerCase()) : true;
    const matchesShelter = selectedShelter ? pet.shelter?.toLowerCase().includes(selectedShelter.toLowerCase()) : true;

    return matchesName && matchesSpecies && matchesBreed && matchesShelter;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>HU01 - Mascotas disponibles</h2>
      <p className={styles.subtitle}>Encuentra una mascota para adoptar</p>

      {/* Barra de Filtros */}
      <div className={styles.filtersGrid}>
        <input
          type="text"
          className={styles.input}
          placeholder="Buscar por nombre..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          className={styles.input}
          placeholder="Especie (ej. Perro)"
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
        />
        <input
          type="text"
          className={styles.input}
          placeholder="Raza"
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
        />
        <input
          type="text"
          className={styles.input}
          placeholder="Refugio"
          value={selectedShelter}
          onChange={(e) => setSelectedShelter(e.target.value)}
        />
      </div>

      {loading && <p>Cargando mascotas disponibles...</p>}
      {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}

      {!loading && !error && filteredPets.length === 0 && (
        <div className={styles.noResults}>
          No se encontraron mascotas que cumplan con los filtros aplicados.
        </div>
      )}

      {!loading && !error && filteredPets.length > 0 && (
        <div className={styles.petsGrid}>
          {filteredPets.map((pet) => (
            <div key={pet.id} className={styles.card}>
              <div className={styles.cardIcon}>
                {pet.species?.toLowerCase() === 'perro' ? '🐶' : '🐱'}
              </div>
              <h3 className={styles.cardTitle}>{pet.name}</h3>
              <p className={styles.cardDetail}>
                {pet.species} - {pet.breed} - {pet.age} {pet.age === 1 ? 'año' : 'años'}
              </p>
              <p className={styles.cardSubdetail}>
                Refugio: {pet.shelter}
              </p>
              <div>
                <span className={styles.badge}>
                  {pet.adoptionStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetsPage;

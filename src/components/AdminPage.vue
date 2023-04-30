<template>
  <div>
    <h1>Admin Page</h1>
    <h2>Gestion des utilisateurs</h2>
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button @click="editUser(user)">Modifier</button>
            <button @click="deleteUser(user)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default {
  name: 'AdminPage',
  data() {
    return {
      users: [
        { id: 1, name: "John Doe", email: "johndoe@example.com", role: "admin" },
        { id: 2, name: "Jane Doe", email: "janedoe@example.com", role: "user" },
        { id: 3, name: "Bob Smith", email: "bobsmith@example.com", role: "user" },
      ],
    };
  },
  methods: {
    editUser(user) {
      // Implement edit user functionality here
      console.log("Editing user: ", user);
    },
    deleteUser(user) {
      // Implement delete user functionality here
      console.log("Deleting user: ", user);
    },
  },
};
</script>
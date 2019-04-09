<template>
  <div class="container">
    <div class="columns is-multiline">
      <div class="column is-3" v-for="item in items" :key="item.id">
        <div class="card">
          <div class="card-content">
            <a class="media" :href="item.url">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img :src="item.imageUrl" :alt="item.name">
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-4">{{item.name}}</p>
              </div>
            </a>
            <div class="content">
              {{item.description}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <a @click="loadMore" :class="loadMoreClasses">Load More</a>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    query: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      busy: false
    } 
  },
  computed: {
    loadMoreClasses () {
      const classes = ['button']

      if (this.busy) {
        classes.push('is-loading')
      }

      return classes.join(' ')
    }
  },
  methods: {
    loadMore () {
      const params = {
        ...this.query,
        page: this.query.page + 1
      }
      axios.get('/api/repos', {
        params,
      })
        .then((res) => {
          this.busy = false
          const { data } = res
          this.query = params
          this.items.push(...data)
        })
      this.busy = true
    }
  }
}
</script>


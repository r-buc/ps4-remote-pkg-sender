<template>
<el-dialog title="Download Item" v-model="show">

    <webview :src="item" v-if="item" useragent="StoreHAX" style="width: 100vw; height: 100vh;" />

    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="hide">Cancel</el-button>
      </span>
    </template>

</el-dialog>
</template>

<script>
export default {
    name: 'DownloadItem',

    data(){ return {
        show: false,
        item: null,
    }},

    methods: {
        open(item){
            this.show = true
            this.item = item
        },
        hide(){
            this.show = false
            this.item = null
        },
        toggle(){ this.show = !this.show },
    }
}
</script>

<style lang="scss" scoped>
.el-dialog {
    width: 550px;
}

.el-dialog__body {
    padding: 0 20px;
}

.el-form-item {
    margin-bottom: 10px;
}
</style>

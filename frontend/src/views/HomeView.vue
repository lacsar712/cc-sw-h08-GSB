<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'

const router = useRouter()
const role = ref(localStorage.getItem('role') || '')
const jobs = ref([])
// 列表轮询错误与提交结果分开：碰壁原因不被轮询刷新覆盖，成功横幅也不被轮询清掉。
const listErr = ref('')
const submitErr = ref('')
const okMsg = ref('')
const form = ref({ lamp: '', nominal_nm: 0.15, measured_nm: 0.15 })
let timer

async function refresh() {
  if (!localStorage.getItem('tok')) return
  try {
    const data = await api('/api/jobs')
    // 后端已按 id DESC 返回，直接展示库里的真实行（含真实 pending/done），不垫空行。
    jobs.value = data || []
    listErr.value = ''
  } catch (e) {
    listErr.value = String(e.message || e)
  }
}

async function submit() {
  submitErr.value = ''
  okMsg.value = ''
  try {
    // 只有后端真正落盘才会返回 200 与真实 id；此时才允许成功横幅。
    const res = await api('/api/jobs', { method: 'POST', body: JSON.stringify(form.value) })
    okMsg.value = `已入队，任务编号 #${res.id}`
    await refresh()
  } catch (e) {
    // 被拒（如只读账号）只展示真实原因，不插任何空行、不伪装成功。
    submitErr.value = String(e.message || e)
  }
}

function goDetail(id) {
  router.push(`/jobs/${id}`)
}

onMounted(() => {
  role.value = localStorage.getItem('role') || ''
  refresh()
  timer = setInterval(refresh, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div>
    <p v-if="listErr" style="color:#b00020">{{ listErr }}</p>
    <p v-if="submitErr" style="color:#b00020">{{ submitErr }}</p>
    <p v-if="okMsg" style="color:#0a7d28; font-weight:600">{{ okMsg }}</p>
    <section v-if="role === 'writer'" style="margin:16px 0; padding:12px; border:1px solid #ccc;">
      <h3>提交校准</h3>
      <label>灯种 <input v-model="form.lamp" /></label>
      <label>标称 nm <input type="number" step="0.01" v-model.number="form.nominal_nm" /></label>
      <label>实测 nm <input type="number" step="0.01" v-model.number="form.measured_nm" /></label>
      <button @click="submit">入队</button>
    </section>
    <table border="1" cellpadding="6" style="border-collapse:collapse; width:100%;">
      <thead>
        <tr>
          <th>编号</th><th>灯种</th><th>标称</th><th>实测</th><th>状态</th><th>结论</th><th>理由</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="j in jobs"
          :key="j.id"
          style="cursor:pointer"
          @click="goDetail(j.id)"
        >
          <td>{{ j.id }}</td>
          <td>{{ j.lamp }}</td>
          <td>{{ j.nominal_nm }}</td>
          <td>{{ j.measured_nm }}</td>
          <td>{{ j.status }}</td>
          <td>{{ j.verdict }}</td>
          <td>{{ j.reason }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

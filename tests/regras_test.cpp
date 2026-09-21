#include <cassert>
#include "../esp32/include/regras.h"
int main(){
 assert(decidir("disponivel",0,1,"aluno")==Decisao::Abrir);
 assert(decidir("em_uso",1,2,"aluno")==Decisao::Negar);
 assert(decidir("em_uso",1,2,"limpeza")==Decisao::Negar);
 assert(decidir("em_uso",1,2,"professor")==Decisao::Transferir);
 assert(decidir("em_uso",1,2,"completo")==Decisao::Transferir);
 assert(decidir("em_uso",1,1,"professor")==Decisao::Fechar);
 assert(decidir("em_uso",2,2,"aluno")==Decisao::Fechar);
 assert(decidir("manutencao",0,1,"completo")==Decisao::Negar);
 assert(decidir("erro",0,1,"completo")==Decisao::Negar);
 assert(decidir("invalido",0,1,"professor")==Decisao::Negar);
}
